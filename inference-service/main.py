"""
Birdhouse inference service.

Reads RTSP frames → motion → bird detect → species classify → Supabase.
"""

from __future__ import annotations

import asyncio
import logging
import time
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from capture import frame_generator
from classify_species import SpeciesClassifier
from config import Settings, load_settings
from debounce import Debouncer
from detect_bird import BirdDetector
from detect_motion import MotionDetector
from supabase_client import SupabaseWriter
from visit_capture import VisitCaptureWindow

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("inference")


@dataclass
class RuntimeStatus:
    started_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    loop_running: bool = False
    last_frame_at: Optional[str] = None
    last_motion_at: Optional[str] = None
    last_bird_at: Optional[str] = None
    last_observation_at: Optional[str] = None
    last_label: Optional[str] = None
    frames_seen: int = 0
    motion_triggers: int = 0
    birds_detected: int = 0
    observations_written: int = 0
    unknown_observations: int = 0
    rejected_predictions: int = 0
    species_tally: Dict[str, int] = field(default_factory=dict)
    last_error: Optional[str] = None
    debounce_skips: int = 0
    last_frame_quality: Optional[float] = None
    last_frame_sharpness: Optional[float] = None


status = RuntimeStatus()
settings: Settings = load_settings()
_loop_task: Optional[asyncio.Task] = None


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def capture_loop(cfg: Settings) -> None:
    status.loop_running = True
    motion = MotionDetector(
        threshold=cfg.motion_threshold,
        min_area_fraction=cfg.motion_min_area_fraction,
        max_area_fraction=cfg.motion_max_area_fraction,
        min_concentration=cfg.motion_min_concentration,
        roi=cfg.motion_roi,
    )
    bird = BirdDetector(
        model_path=cfg.bird_model_path,
        confidence_threshold=cfg.detection_confidence_threshold,
    )
    classifier = SpeciesClassifier(
        model_id=cfg.species_model_id,
        confidence_threshold=cfg.classification_confidence_threshold,
        margin_threshold=cfg.classification_margin_threshold,
        enabled=cfg.enable_species_classifier,
    )
    writer = SupabaseWriter(
        url=cfg.supabase_url,
        service_role_key=cfg.supabase_service_role_key,
        recent_image_limit=cfg.recent_image_limit,
        dry_run=cfg.dry_run,
    )
    debouncer = Debouncer(cfg.debounce_seconds)
    visit = VisitCaptureWindow(
        duration_seconds=cfg.capture_window_seconds,
        sample_interval_seconds=cfg.capture_sample_interval_seconds,
    )
    next_visit_allowed_at = 0.0

    # Load heavy models off the event loop.
    await asyncio.to_thread(bird.load)
    if cfg.enable_species_classifier:
        await asyncio.to_thread(classifier.load)
    if not cfg.dry_run:
        await asyncio.to_thread(writer.connect)
        await asyncio.to_thread(writer.cleanup_pending_images)

    logger.info("Capture loop starting (frame_skip=%s)", cfg.frame_skip)
    gen = frame_generator(
        cfg.rtsp_url,
        reconnect_delay_seconds=cfg.reconnect_delay_seconds,
    )
    frame_index = 0

    try:
        while True:
            try:
                frame = await asyncio.to_thread(next, gen)
            except StopIteration:
                logger.error("Frame generator stopped unexpectedly")
                break
            except Exception as exc:
                status.last_error = str(exc)
                logger.exception("Frame read error")
                await asyncio.sleep(cfg.reconnect_delay_seconds)
                continue

            status.frames_seen += 1
            status.last_frame_at = _iso_now()
            frame_index += 1
            now = time.monotonic()

            # Idle: skip frames to save CPU. Active visit: use every frame so
            # fast birds (titmice) are not missed between samples.
            if (
                not visit.active
                and cfg.frame_skip > 1
                and (frame_index % cfg.frame_skip) != 0
            ):
                await asyncio.sleep(0)
                continue

            motion_result = await asyncio.to_thread(motion.update, frame)
            if (
                not visit.active
                and motion_result.triggered
                and now >= next_visit_allowed_at
            ):
                visit.start(now)
                status.motion_triggers += 1
                status.last_motion_at = _iso_now()
                logger.info(
                    "Motion triggered; collecting bird candidates for %.1fs "
                    "(sample every %.2fs)",
                    cfg.capture_window_seconds,
                    cfg.capture_sample_interval_seconds,
                )

            if not visit.active:
                await asyncio.sleep(0)
                continue

            # Keep motion crops every frame — titmice are often gone in <1s.
            if motion_result.triggered:
                visit.add_motion_candidate(frame, motion_result.contour_bbox)

            if visit.should_sample(now):
                detection = await asyncio.to_thread(bird.best, frame)
                visit.add(detection, now, frame=frame)
                if detection is not None:
                    status.birds_detected += 1
                    status.last_bird_at = _iso_now()

            if not visit.complete(now):
                await asyncio.sleep(0)
                continue

            best = visit.finish()
            if best is None:
                next_visit_allowed_at = now + min(3.0, cfg.debounce_seconds)
                logger.info("Capture window ended without a bird detection")
                await asyncio.sleep(0)
                continue

            next_visit_allowed_at = now + cfg.debounce_seconds
            status.last_frame_quality = best.quality
            status.last_frame_sharpness = best.sharpness
            logger.info(
                "Selected bird crop source=%s detector_conf=%.2f "
                "quality=%.2f sharpness=%.1f",
                best.source,
                best.detection.confidence,
                best.quality,
                best.sharpness,
            )

            prediction = await asyncio.to_thread(
                classifier.classify, best.detection.crop
            )
            label = prediction.label
            confidence = prediction.confidence

            if not prediction.accepted:
                status.rejected_predictions += 1
                status.last_label = label
                logger.info(
                    "Species prediction rejected reason=%s top_conf=%.2f "
                    "second=%s second_conf=%.2f",
                    prediction.rejection_reason,
                    prediction.confidence,
                    prediction.second_label or "none",
                    prediction.second_confidence,
                )
                if confidence >= cfg.unknown_min_confidence:
                    try:
                        await asyncio.to_thread(
                            writer.record_unrecognized,
                            confidence=confidence,
                            bbox=best.detection.bbox,
                        )
                        status.unknown_observations += 1
                        status.observations_written += 1
                        status.last_observation_at = _iso_now()
                        status.last_error = None
                    except Exception as exc:
                        status.last_error = str(exc)
                        logger.exception("Failed to record uncertain bird observation")
                else:
                    logger.info(
                        "Discarding weak unknown prediction below %.2f",
                        cfg.unknown_min_confidence,
                    )
                await asyncio.sleep(0)
                continue

            if not debouncer.allow(label):
                status.debounce_skips += 1
                logger.debug("Debounced duplicate sighting for %s", label)
                await asyncio.sleep(0)
                continue

            try:
                # Upload the wide feeder-context crop, not the tight classify crop.
                moment_image = best.gallery_image
                if moment_image is None or moment_image.size == 0:
                    moment_image = best.detection.crop
                result = await asyncio.to_thread(
                    writer.record_sighting,
                    label=label,
                    confidence=confidence,
                    image_bgr=moment_image,
                    bbox=best.detection.bbox,
                )
                status.observations_written += 1
                status.last_observation_at = _iso_now()
                status.last_label = label
                status.species_tally[label] = status.species_tally.get(label, 0) + 1
                status.last_error = None
                logger.info(
                    "Logged sighting label=%s conf=%.2f url=%s",
                    label,
                    confidence,
                    result.get("image_url"),
                )
            except Exception as exc:
                status.last_error = str(exc)
                logger.exception("Failed to write sighting to Supabase")

            await asyncio.sleep(0)
    finally:
        status.loop_running = False
        logger.info("Capture loop stopped")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _loop_task, settings
    settings = load_settings()
    if not settings.rtsp_url:
        logger.warning("RTSP_URL unset — /health still works; capture loop idle")
    else:
        _loop_task = asyncio.create_task(capture_loop(settings))
    yield
    if _loop_task is not None:
        _loop_task.cancel()
        try:
            await _loop_task
        except asyncio.CancelledError:
            pass


app = FastAPI(title="Birdhouse Inference", version="0.1.0", lifespan=lifespan)


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "ok": True,
        "loop_running": status.loop_running,
        "rtsp_configured": bool(settings.rtsp_url),
    }


@app.get("/status")
def get_status() -> JSONResponse:
    payload = {
        "started_at": status.started_at,
        "loop_running": status.loop_running,
        "last_frame_at": status.last_frame_at,
        "last_motion_at": status.last_motion_at,
        "last_bird_at": status.last_bird_at,
        "last_observation_at": status.last_observation_at,
        "last_label": status.last_label,
        "frames_seen": status.frames_seen,
        "motion_triggers": status.motion_triggers,
        "birds_detected": status.birds_detected,
        "observations_written": status.observations_written,
        "unknown_observations": status.unknown_observations,
        "rejected_predictions": status.rejected_predictions,
        "debounce_skips": status.debounce_skips,
        "last_frame_quality": status.last_frame_quality,
        "last_frame_sharpness": status.last_frame_sharpness,
        "species_tally": status.species_tally,
        "last_error": status.last_error,
        "config": {
            "motion_threshold": settings.motion_threshold,
            "motion_roi": list(settings.motion_roi),
            "motion_min_concentration": settings.motion_min_concentration,
            "capture_window_seconds": settings.capture_window_seconds,
            "capture_sample_interval_seconds": settings.capture_sample_interval_seconds,
            "detection_confidence_threshold": settings.detection_confidence_threshold,
            "classification_confidence_threshold": settings.classification_confidence_threshold,
            "classification_margin_threshold": settings.classification_margin_threshold,
            "unknown_min_confidence": settings.unknown_min_confidence,
            "debounce_seconds": settings.debounce_seconds,
            "recent_image_limit": settings.recent_image_limit,
            "dry_run": settings.dry_run,
            "enable_species_classifier": settings.enable_species_classifier,
            "species_model_id": settings.species_model_id,
        },
    }
    return JSONResponse(payload)


if __name__ == "__main__":
    import uvicorn

    cfg = load_settings()
    uvicorn.run(
        "main:app",
        host=cfg.host,
        port=cfg.port,
        reload=False,
    )

"""Environment-driven settings for the inference service."""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Tuple


def _float(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None or raw == "":
        return default
    return float(raw)


def _int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or raw == "":
        return default
    return int(raw)


def _bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None or raw == "":
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _roi(name: str, default: Tuple[float, float, float, float]) -> Tuple[float, float, float, float]:
    """Parse MOTION_ROI as x,y,w,h fractions of the frame (0–1)."""
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    parts = [p.strip() for p in raw.split(",")]
    if len(parts) != 4:
        return default
    try:
        x, y, w, h = (float(p) for p in parts)
    except ValueError:
        return default
    if w <= 0 or h <= 0:
        return default
    return (x, y, w, h)


@dataclass(frozen=True)
class Settings:
    rtsp_url: str
    supabase_url: str
    supabase_service_role_key: str
    motion_threshold: float
    motion_min_area_fraction: float
    motion_max_area_fraction: float
    motion_min_concentration: float
    motion_roi: Tuple[float, float, float, float]
    detection_confidence_threshold: float
    classification_confidence_threshold: float
    classification_margin_threshold: float
    unknown_min_confidence: float
    debounce_seconds: float
    capture_window_seconds: float
    capture_sample_interval_seconds: float
    frame_skip: int
    reconnect_delay_seconds: float
    bird_model_path: str
    species_model_id: str
    enable_species_classifier: bool
    recent_image_limit: int
    dry_run: bool
    host: str
    port: int


def load_settings() -> Settings:
    return Settings(
        rtsp_url=os.getenv("RTSP_URL", "").strip(),
        supabase_url=os.getenv("SUPABASE_URL", "").strip(),
        supabase_service_role_key=os.getenv(
            "SUPABASE_SERVICE_ROLE_KEY", ""
        ).strip(),
        # Higher than foliage flutter; ROI + concentration do most of the work.
        motion_threshold=_float("MOTION_THRESHOLD", 30.0),
        motion_min_area_fraction=_float("MOTION_MIN_AREA_FRACTION", 0.004),
        motion_max_area_fraction=_float("MOTION_MAX_AREA_FRACTION", 0.20),
        motion_min_concentration=_float("MOTION_MIN_CONCENTRATION", 0.40),
        # Ignore canopy/edges; focus on the birdhouse landing area.
        motion_roi=_roi("MOTION_ROI", (0.10, 0.20, 0.80, 0.75)),
        detection_confidence_threshold=_float(
            "DETECTION_CONFIDENCE_THRESHOLD", 0.25
        ),
        classification_confidence_threshold=_float(
            "CLASSIFICATION_CONFIDENCE_THRESHOLD", 0.75
        ),
        classification_margin_threshold=_float(
            "CLASSIFICATION_MARGIN_THRESHOLD", 0.15
        ),
        unknown_min_confidence=_float("UNKNOWN_MIN_CONFIDENCE", 0.20),
        debounce_seconds=_float("DEBOUNCE_SECONDS", 60.0),
        # Short burst window — fast birds rarely stay longer than this.
        capture_window_seconds=_float("MIN_CAPTURE_SECONDS", 1.5),
        # Dense sampling during the burst (~6–7 YOLO checks/sec).
        capture_sample_interval_seconds=_float(
            "CAPTURE_SAMPLE_INTERVAL_SECONDS", 0.15
        ),
        frame_skip=_int("FRAME_SKIP", 2),
        reconnect_delay_seconds=_float("RECONNECT_DELAY_SECONDS", 2.0),
        bird_model_path=os.getenv("BIRD_MODEL_PATH", "yolov8n.pt").strip(),
        species_model_id=os.getenv(
            "SPECIES_MODEL_ID",
            "houlette/birdclass-na",
        ).strip(),
        enable_species_classifier=_bool("ENABLE_SPECIES_CLASSIFIER", True),
        recent_image_limit=max(1, _int("RECENT_IMAGE_LIMIT", 6)),
        dry_run=_bool("DRY_RUN", False),
        host=os.getenv("HOST", "0.0.0.0").strip(),
        port=_int("PORT", 8080),
    )

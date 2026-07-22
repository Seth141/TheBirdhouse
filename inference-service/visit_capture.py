"""Visit capture-window state and best-frame selection."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import cv2
import numpy as np

from detect_bird import BBox, BirdDetection
from frame_crop import classify_crop, gallery_crop


@dataclass
class BestBirdFrame:
    detection: BirdDetection
    quality: float
    sharpness: float
    source: str = "yolo"
    frame: Optional[np.ndarray] = None
    gallery_image: Optional[np.ndarray] = None


class VisitCaptureWindow:
    """Collect low-rate bird detections during one fixed-length visit window."""

    def __init__(self, duration_seconds: float, sample_interval_seconds: float) -> None:
        self.duration_seconds = max(0.1, duration_seconds)
        self.sample_interval_seconds = max(0.05, sample_interval_seconds)
        self.started_at: Optional[float] = None
        self.last_sample_at: Optional[float] = None
        self.best: Optional[BestBirdFrame] = None
        self.fallback: Optional[BestBirdFrame] = None

    @property
    def active(self) -> bool:
        return self.started_at is not None

    def start(self, now: float) -> None:
        self.started_at = now
        self.last_sample_at = None
        self.best = None
        self.fallback = None

    def should_sample(self, now: float) -> bool:
        if not self.active:
            return False
        return (
            self.last_sample_at is None
            or (now - self.last_sample_at) >= self.sample_interval_seconds
        )

    def add(
        self,
        detection: Optional[BirdDetection],
        now: float,
        frame: Optional[np.ndarray] = None,
    ) -> None:
        self.last_sample_at = now
        if detection is None or detection.crop.size == 0:
            return

        gray = cv2.cvtColor(detection.crop, cv2.COLOR_BGR2GRAY)
        sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        _, _, width, height = detection.bbox
        area_bonus = min((width * height) / 100_000.0, 1.0)
        sharpness_bonus = min(sharpness / 500.0, 1.0)
        quality = (
            detection.confidence * 0.65
            + sharpness_bonus * 0.25
            + area_bonus * 0.10
        )
        candidate = BestBirdFrame(
            detection=detection,
            quality=quality,
            sharpness=sharpness,
            frame=None if frame is None else frame.copy(),
        )
        if self.best is None or candidate.quality > self.best.quality:
            self.best = candidate

    def add_motion_candidate(
        self,
        frame: np.ndarray,
        bbox: Optional[BBox],
    ) -> None:
        """Keep an expanded motion crop when generic YOLO misses a small bird."""
        if bbox is None or frame.size == 0:
            return

        frame_height, frame_width = frame.shape[:2]
        x, y, width, height = bbox
        frame_area = frame_width * frame_height
        blob_area = width * height
        # Skip canopy-sized / sheet motion (leaves) and tiny noise.
        if blob_area > frame_area * 0.20 or blob_area < frame_area * 0.002:
            return
        aspect = width / float(max(height, 1))
        if aspect > 4.0 or aspect < 0.2:
            return

        crop = classify_crop(frame, bbox, pad_scale=0.8)
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        area_bonus = min((crop.shape[1] * crop.shape[0]) / 100_000.0, 1.0)
        quality = min(sharpness / 500.0, 1.0) * 0.8 + area_bonus * 0.2
        candidate = BestBirdFrame(
            detection=BirdDetection(
                confidence=0.0,
                bbox=bbox,
                crop=crop,
            ),
            quality=quality,
            sharpness=sharpness,
            source="motion",
            frame=frame.copy(),
        )
        if self.fallback is None or candidate.quality > self.fallback.quality:
            self.fallback = candidate

    def complete(self, now: float) -> bool:
        return self.started_at is not None and (
            now - self.started_at
        ) >= self.duration_seconds

    def finish(self) -> Optional[BestBirdFrame]:
        best = self.best or self.fallback
        if best is not None and best.frame is not None:
            best.gallery_image = gallery_crop(best.frame, best.detection.bbox)
            # Prefer the wider gallery image for any downstream display upload.
            best.detection = BirdDetection(
                confidence=best.detection.confidence,
                bbox=best.detection.bbox,
                crop=best.detection.crop,
            )
        elif best is not None:
            best.gallery_image = best.detection.crop

        self.started_at = None
        self.last_sample_at = None
        self.best = None
        self.fallback = None
        return best

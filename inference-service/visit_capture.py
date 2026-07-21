"""Visit capture-window state and best-frame selection."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import cv2

from detect_bird import BirdDetection


@dataclass
class BestBirdFrame:
    detection: BirdDetection
    quality: float
    sharpness: float


class VisitCaptureWindow:
    """Collect low-rate bird detections during one fixed-length visit window."""

    def __init__(self, duration_seconds: float, sample_interval_seconds: float) -> None:
        self.duration_seconds = max(0.1, duration_seconds)
        self.sample_interval_seconds = max(0.05, sample_interval_seconds)
        self.started_at: Optional[float] = None
        self.last_sample_at: Optional[float] = None
        self.best: Optional[BestBirdFrame] = None

    @property
    def active(self) -> bool:
        return self.started_at is not None

    def start(self, now: float) -> None:
        self.started_at = now
        self.last_sample_at = None
        self.best = None

    def should_sample(self, now: float) -> bool:
        if not self.active:
            return False
        return (
            self.last_sample_at is None
            or (now - self.last_sample_at) >= self.sample_interval_seconds
        )

    def add(self, detection: Optional[BirdDetection], now: float) -> None:
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
        )
        if self.best is None or candidate.quality > self.best.quality:
            self.best = candidate

    def complete(self, now: float) -> bool:
        return self.started_at is not None and (
            now - self.started_at
        ) >= self.duration_seconds

    def finish(self) -> Optional[BestBirdFrame]:
        best = self.best
        self.started_at = None
        self.last_sample_at = None
        self.best = None
        return best

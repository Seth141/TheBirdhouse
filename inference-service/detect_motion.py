"""Cheap motion / presence check via running-average background differencing."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Tuple

import cv2
import numpy as np

BBox = Tuple[int, int, int, int]  # x, y, w, h


@dataclass
class MotionResult:
    triggered: bool
    score: float
    contour_bbox: Optional[BBox] = None


class MotionDetector:
    """
    Running average background model. Trigger when the largest moving blob
    exceeds `threshold` (mean absolute difference scaled to 0–255).
    """

    def __init__(
        self,
        *,
        threshold: float = 25.0,
        alpha: float = 0.05,
        min_area: int = 800,
        blur_ksize: int = 21,
    ) -> None:
        self.threshold = threshold
        self.alpha = alpha
        self.min_area = min_area
        self.blur_ksize = blur_ksize if blur_ksize % 2 == 1 else blur_ksize + 1
        self._bg: Optional[np.ndarray] = None

    def reset(self) -> None:
        self._bg = None

    def update(self, frame: np.ndarray) -> MotionResult:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (self.blur_ksize, self.blur_ksize), 0)

        if self._bg is None:
            self._bg = gray.astype("float32")
            return MotionResult(triggered=False, score=0.0)

        cv2.accumulateWeighted(gray, self._bg, self.alpha)
        diff = cv2.absdiff(gray, cv2.convertScaleAbs(self._bg))
        score = float(np.mean(diff))

        _, thresh = cv2.threshold(diff, max(self.threshold, 1), 255, cv2.THRESH_BINARY)
        thresh = cv2.dilate(thresh, None, iterations=2)
        contours, _ = cv2.findContours(
            thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

        best: Optional[BBox] = None
        best_area = 0
        for contour in contours:
            area = cv2.contourArea(contour)
            if area < self.min_area:
                continue
            if area > best_area:
                best_area = int(area)
                x, y, w, h = cv2.boundingRect(contour)
                best = (x, y, w, h)

        triggered = best is not None and score >= self.threshold * 0.15
        return MotionResult(triggered=triggered, score=score, contour_bbox=best)

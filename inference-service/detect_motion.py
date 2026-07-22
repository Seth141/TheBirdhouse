"""Cheap motion / presence check via running-average background differencing."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Tuple

import cv2
import numpy as np

BBox = Tuple[int, int, int, int]  # x, y, w, h
# ROI as fractions of the frame: x, y, width, height in 0–1.
RoiFractions = Tuple[float, float, float, float]


@dataclass
class MotionResult:
    triggered: bool
    score: float
    contour_bbox: Optional[BBox] = None
    concentration: float = 0.0
    blob_area: int = 0


class MotionDetector:
    """
    Running-average background model tuned for a birdhouse camera.

    Leaf/wind clutter creates many small scattered blobs. Real visitors make
    one denser blob inside the configured region of interest.
    """

    def __init__(
        self,
        *,
        threshold: float = 30.0,
        alpha: float = 0.08,
        min_area_fraction: float = 0.004,
        max_area_fraction: float = 0.20,
        min_concentration: float = 0.40,
        blur_ksize: int = 21,
        roi: RoiFractions = (0.10, 0.20, 0.80, 0.75),
    ) -> None:
        self.threshold = threshold
        self.alpha = alpha
        self.min_area_fraction = min_area_fraction
        self.max_area_fraction = max_area_fraction
        self.min_concentration = min_concentration
        self.blur_ksize = blur_ksize if blur_ksize % 2 == 1 else blur_ksize + 1
        self.roi = roi
        self._bg: Optional[np.ndarray] = None

    def reset(self) -> None:
        self._bg = None

    def _roi_slice(self, frame_h: int, frame_w: int) -> Tuple[int, int, int, int]:
        x_frac, y_frac, w_frac, h_frac = self.roi
        x1 = max(0, min(frame_w - 1, int(frame_w * x_frac)))
        y1 = max(0, min(frame_h - 1, int(frame_h * y_frac)))
        x2 = max(x1 + 1, min(frame_w, int(frame_w * (x_frac + w_frac))))
        y2 = max(y1 + 1, min(frame_h, int(frame_h * (y_frac + h_frac))))
        return x1, y1, x2, y2

    def update(self, frame: np.ndarray) -> MotionResult:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (self.blur_ksize, self.blur_ksize), 0)
        frame_h, frame_w = gray.shape[:2]
        frame_area = float(frame_h * frame_w)
        x1, y1, x2, y2 = self._roi_slice(frame_h, frame_w)

        if self._bg is None:
            self._bg = gray.astype("float32")
            return MotionResult(triggered=False, score=0.0)

        # Diff against the existing model first, then adapt — otherwise sudden
        # visitors get half-absorbed into the background before we score them.
        diff = cv2.absdiff(gray, cv2.convertScaleAbs(self._bg))
        cv2.accumulateWeighted(gray, self._bg, self.alpha)

        # Ignore tree canopy / sky above and sides outside the birdhouse ROI.
        masked = np.zeros_like(diff)
        masked[y1:y2, x1:x2] = diff[y1:y2, x1:x2]
        roi_pixels = max(1, (x2 - x1) * (y2 - y1))
        score = float(np.mean(masked[y1:y2, x1:x2]))

        _, thresh = cv2.threshold(
            masked, max(self.threshold, 1), 255, cv2.THRESH_BINARY
        )
        thresh = cv2.dilate(thresh, None, iterations=2)
        contours, _ = cv2.findContours(
            thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

        best: Optional[BBox] = None
        best_area = 0
        total_area = 0
        min_area = int(frame_area * self.min_area_fraction)
        max_area = int(frame_area * self.max_area_fraction)

        for contour in contours:
            area = int(cv2.contourArea(contour))
            if area < min_area:
                continue
            total_area += area
            if area > best_area:
                best_area = area
                x, y, w, h = cv2.boundingRect(contour)
                best = (x, y, w, h)

        if best is None or best_area > max_area:
            return MotionResult(
                triggered=False,
                score=score,
                blob_area=best_area,
            )

        # Leaves create many scattered blobs; birds create one dominant blob.
        concentration = best_area / float(max(total_area, 1))
        if concentration < self.min_concentration:
            return MotionResult(
                triggered=False,
                score=score,
                contour_bbox=best,
                concentration=concentration,
                blob_area=best_area,
            )

        # Reject huge thin sheets of motion that look like wind-blown foliage.
        bx, by, bw, bh = best
        aspect = bw / float(max(bh, 1))
        if aspect > 4.0 or aspect < 0.2:
            return MotionResult(
                triggered=False,
                score=score,
                contour_bbox=best,
                concentration=concentration,
                blob_area=best_area,
            )

        triggered = score >= self.threshold * 0.12
        return MotionResult(
            triggered=triggered,
            score=score,
            contour_bbox=best,
            concentration=concentration,
            blob_area=best_area,
        )

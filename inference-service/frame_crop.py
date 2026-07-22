"""Helpers for building roomy gallery crops from a full camera frame."""

from __future__ import annotations

from typing import Tuple

import numpy as np

BBox = Tuple[int, int, int, int]  # x, y, w, h


def gallery_crop(
    frame: np.ndarray,
    bbox: BBox,
    *,
    aspect: float = 4.0 / 3.0,
    min_coverage: float = 0.42,
    pad_scale: float = 2.2,
) -> np.ndarray:
    """
    Build a wide context crop for Recent Moments.

    Expands well beyond the detector box so the feeder / birdhouse stays in
    view, then fits a landscape window around the bird.
    """
    if frame.size == 0:
        return frame

    frame_h, frame_w = frame.shape[:2]
    x, y, w, h = bbox
    cx = x + w / 2.0
    cy = y + h / 2.0

    # Start from a padded box, then grow until we cover enough of the frame.
    crop_w = max(w * pad_scale, frame_w * min_coverage)
    crop_h = max(h * pad_scale, frame_h * min_coverage)

    # Prefer a landscape gallery frame matching the UI cards.
    if crop_w / max(crop_h, 1.0) < aspect:
        crop_w = crop_h * aspect
    else:
        crop_h = crop_w / aspect

    # Never exceed the full frame; if needed, use the whole image.
    crop_w = min(crop_w, float(frame_w))
    crop_h = min(crop_h, float(frame_h))

    x1 = int(round(cx - crop_w / 2.0))
    y1 = int(round(cy - crop_h / 2.0))
    x2 = int(round(x1 + crop_w))
    y2 = int(round(y1 + crop_h))

    if x1 < 0:
        x2 -= x1
        x1 = 0
    if y1 < 0:
        y2 -= y1
        y1 = 0
    if x2 > frame_w:
        x1 -= x2 - frame_w
        x2 = frame_w
    if y2 > frame_h:
        y1 -= y2 - frame_h
        y2 = frame_h

    x1 = max(0, x1)
    y1 = max(0, y1)
    x2 = min(frame_w, x2)
    y2 = min(frame_h, y2)
    if x2 <= x1 or y2 <= y1:
        return frame.copy()
    return frame[y1:y2, x1:x2].copy()


def classify_crop(
    frame: np.ndarray,
    bbox: BBox,
    *,
    pad_scale: float = 0.35,
) -> np.ndarray:
    """Tighter crop around the bird for the species classifier."""
    if frame.size == 0:
        return frame
    frame_h, frame_w = frame.shape[:2]
    x, y, w, h = bbox
    pad_x = max(8, int(w * pad_scale))
    pad_y = max(8, int(h * pad_scale))
    x1 = max(0, x - pad_x)
    y1 = max(0, y - pad_y)
    x2 = min(frame_w, x + w + pad_x)
    y2 = min(frame_h, y + h + pad_y)
    if x2 <= x1 or y2 <= y1:
        return frame.copy()
    return frame[y1:y2, x1:x2].copy()

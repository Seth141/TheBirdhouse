"""Bird-vs-not-bird detector using a lightweight YOLO model (COCO bird class)."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import List, Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)

BBox = Tuple[int, int, int, int]  # x, y, w, h
COCO_BIRD_CLASS_ID = 14


@dataclass
class BirdDetection:
    confidence: float
    bbox: BBox
    crop: np.ndarray


class BirdDetector:
    """
    Off-the-shelf YOLOv8n with COCO's generic 'bird' class.

    Filters leaves / squirrels / shadows that trip motion detection.
    """

    def __init__(
        self,
        *,
        model_path: str = "yolov8n.pt",
        confidence_threshold: float = 0.45,
    ) -> None:
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self._model = None

    def load(self) -> None:
        if self._model is not None:
            return
        try:
            from ultralytics import YOLO

            logger.info("Loading bird detector: %s", self.model_path)
            self._model = YOLO(self.model_path)
        except Exception:
            logger.exception("Failed to load YOLO bird detector")
            raise

    def detect(self, frame: np.ndarray) -> List[BirdDetection]:
        if self._model is None:
            self.load()

        results = self._model.predict(
            source=frame,
            conf=self.confidence_threshold,
            classes=[COCO_BIRD_CLASS_ID],
            verbose=False,
        )

        detections: List[BirdDetection] = []
        if not results:
            return detections

        result = results[0]
        if result.boxes is None or len(result.boxes) == 0:
            return detections

        h, w = frame.shape[:2]
        for box in result.boxes:
            conf = float(box.conf[0].item())
            x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)
            if x2 <= x1 or y2 <= y1:
                continue
            # Keep the tight detector box; VisitCaptureWindow builds a wide
            # gallery crop from the full frame at finish time.
            pad_x = max(8, int((x2 - x1) * 0.25))
            pad_y = max(8, int((y2 - y1) * 0.25))
            cx1 = max(0, x1 - pad_x)
            cy1 = max(0, y1 - pad_y)
            cx2 = min(w, x2 + pad_x)
            cy2 = min(h, y2 + pad_y)
            crop = frame[cy1:cy2, cx1:cx2].copy()
            detections.append(
                BirdDetection(
                    confidence=conf,
                    bbox=(x1, y1, x2 - x1, y2 - y1),
                    crop=crop,
                )
            )

        detections.sort(key=lambda d: d.confidence, reverse=True)
        return detections

    def best(self, frame: np.ndarray) -> Optional[BirdDetection]:
        dets = self.detect(frame)
        return dets[0] if dets else None

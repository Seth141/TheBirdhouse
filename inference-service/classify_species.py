"""Species classification wrapper — swappable Hugging Face bird classifier."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class SpeciesPrediction:
    label: str
    confidence: float


class SpeciesClassifier:
    """
    classify(image) -> (label, confidence)

    Uses a Hugging Face image-classification model when enabled. Falls back to
    a generic "Bird" label if the model cannot load (keeps the pipeline alive).
    """

    def __init__(
        self,
        *,
        model_id: str = "chriamue/bird-species-classifier",
        confidence_threshold: float = 0.25,
        enabled: bool = True,
    ) -> None:
        self.model_id = model_id
        self.confidence_threshold = confidence_threshold
        self.enabled = enabled
        self._pipeline = None
        self._failed = False

    def load(self) -> None:
        if not self.enabled or self._pipeline is not None or self._failed:
            return
        try:
            from transformers import pipeline

            logger.info("Loading species classifier: %s", self.model_id)
            self._pipeline = pipeline(
                "image-classification",
                model=self.model_id,
            )
        except Exception:
            logger.exception(
                "Species classifier failed to load; using generic Bird label"
            )
            self._failed = True
            self._pipeline = None

    def classify(self, image: np.ndarray) -> SpeciesPrediction:
        """Return (label, confidence) for a BGR crop."""
        if not self.enabled or self._failed:
            return SpeciesPrediction(label="Bird", confidence=0.0)

        if self._pipeline is None:
            self.load()

        if self._pipeline is None:
            return SpeciesPrediction(label="Bird", confidence=0.0)

        try:
            from PIL import Image
            import cv2

            rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            pil = Image.fromarray(rgb)
            preds = self._pipeline(pil, top_k=1)
            if not preds:
                return SpeciesPrediction(label="Bird", confidence=0.0)

            top = preds[0]
            label = str(top.get("label") or "Bird").replace("_", " ").strip()
            score = float(top.get("score") or 0.0)

            if score < self.confidence_threshold:
                return SpeciesPrediction(label="Bird", confidence=score)

            return SpeciesPrediction(label=label, confidence=score)
        except Exception:
            logger.exception("Species classification failed")
            return SpeciesPrediction(label="Bird", confidence=0.0)

    def classify_tuple(self, image: np.ndarray) -> Tuple[str, float]:
        pred = self.classify(image)
        return pred.label, pred.confidence

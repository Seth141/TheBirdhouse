"""Species classification wrapper — swappable Hugging Face bird classifier."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import List, Tuple

import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class SpeciesPrediction:
    label: str
    confidence: float
    second_label: str = ""
    second_confidence: float = 0.0
    accepted: bool = False
    rejection_reason: str = ""


class SpeciesClassifier:
    """
    classify(image) -> (label, confidence)

    Uses a Hugging Face image-classification model when enabled. Falls back to
    a generic "Bird" label if the model cannot load (keeps the pipeline alive).
    """

    def __init__(
        self,
        *,
        model_id: str = "houlette/birdclass-na",
        confidence_threshold: float = 0.75,
        margin_threshold: float = 0.15,
        enabled: bool = True,
    ) -> None:
        self.model_id = model_id
        self.confidence_threshold = confidence_threshold
        self.margin_threshold = margin_threshold
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
        """Classify a BGR crop, rejecting uncertain or out-of-scope results."""
        if not self.enabled or self._failed:
            return SpeciesPrediction(
                label="Unknown bird",
                confidence=0.0,
                rejection_reason="classifier_unavailable",
            )

        if self._pipeline is None:
            self.load()

        if self._pipeline is None:
            return SpeciesPrediction(
                label="Unknown bird",
                confidence=0.0,
                rejection_reason="classifier_unavailable",
            )

        try:
            from PIL import Image
            import cv2

            rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            pil = Image.fromarray(rgb)
            preds: List[dict] = self._pipeline(pil, top_k=3)
            if not preds:
                return SpeciesPrediction(
                    label="Unknown bird",
                    confidence=0.0,
                    rejection_reason="no_predictions",
                )

            top = preds[0]
            label = self._normalize_label(str(top.get("label") or ""))
            score = float(top.get("score") or 0.0)
            second = preds[1] if len(preds) > 1 else {}
            second_label = self._normalize_label(str(second.get("label") or ""))
            second_score = float(second.get("score") or 0.0)

            if label.upper() == "OTHER":
                return SpeciesPrediction(
                    label="Unknown bird",
                    confidence=score,
                    second_label=second_label,
                    second_confidence=second_score,
                    rejection_reason="other",
                )
            if score < self.confidence_threshold:
                return SpeciesPrediction(
                    label="Unknown bird",
                    confidence=score,
                    second_label=second_label,
                    second_confidence=second_score,
                    rejection_reason="low_confidence",
                )
            if (score - second_score) < self.margin_threshold:
                return SpeciesPrediction(
                    label="Unknown bird",
                    confidence=score,
                    second_label=second_label,
                    second_confidence=second_score,
                    rejection_reason="low_margin",
                )

            return SpeciesPrediction(
                label=label,
                confidence=score,
                second_label=second_label,
                second_confidence=second_score,
                accepted=True,
            )
        except Exception:
            logger.exception("Species classification failed")
            return SpeciesPrediction(
                label="Unknown bird",
                confidence=0.0,
                rejection_reason="classification_error",
            )

    @staticmethod
    def _normalize_label(label: str) -> str:
        cleaned = " ".join(label.replace("_", " ").split())
        if not cleaned:
            return "Unknown bird"
        if cleaned.upper() == "OTHER":
            return "OTHER"
        return cleaned.title() if cleaned.isupper() or cleaned.islower() else cleaned

    def classify_tuple(self, image: np.ndarray) -> Tuple[str, float]:
        pred = self.classify(image)
        return pred.label, pred.confidence

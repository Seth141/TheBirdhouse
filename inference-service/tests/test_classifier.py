import unittest

import numpy as np

from classify_species import SpeciesClassifier


class FakePipeline:
    def __init__(self, predictions):
        self.predictions = predictions

    def __call__(self, _image, top_k=3):
        return self.predictions[:top_k]


class SpeciesClassifierTests(unittest.TestCase):
    def classify(self, predictions):
        classifier = SpeciesClassifier(
            confidence_threshold=0.75,
            margin_threshold=0.15,
        )
        classifier._pipeline = FakePipeline(predictions)
        return classifier.classify(np.zeros((32, 32, 3), dtype=np.uint8))

    def test_accepts_confident_prediction_with_clear_margin(self):
        result = self.classify(
            [
                {"label": "NORTHERN_CARDINAL", "score": 0.91},
                {"label": "Pyrrhuloxia", "score": 0.12},
                {"label": "OTHER", "score": 0.01},
            ]
        )
        self.assertTrue(result.accepted)
        self.assertEqual(result.label, "Northern Cardinal")

    def test_rejects_low_confidence(self):
        result = self.classify(
            [
                {"label": "Northern Cardinal", "score": 0.70},
                {"label": "House Finch", "score": 0.10},
            ]
        )
        self.assertFalse(result.accepted)
        self.assertEqual(result.rejection_reason, "low_confidence")

    def test_rejects_narrow_margin(self):
        result = self.classify(
            [
                {"label": "Cooper's Hawk", "score": 0.80},
                {"label": "Sharp-shinned Hawk", "score": 0.70},
            ]
        )
        self.assertFalse(result.accepted)
        self.assertEqual(result.rejection_reason, "low_margin")

    def test_rejects_other_class(self):
        result = self.classify(
            [
                {"label": "OTHER", "score": 0.95},
                {"label": "House Sparrow", "score": 0.02},
            ]
        )
        self.assertFalse(result.accepted)
        self.assertEqual(result.label, "Unknown bird")
        self.assertEqual(result.rejection_reason, "other")


if __name__ == "__main__":
    unittest.main()

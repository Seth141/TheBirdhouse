import unittest

import numpy as np

from detect_bird import BirdDetection
from visit_capture import VisitCaptureWindow


def detection(confidence: float, crop: np.ndarray) -> BirdDetection:
    height, width = crop.shape[:2]
    return BirdDetection(
        confidence=confidence,
        bbox=(0, 0, width, height),
        crop=crop,
    )


class VisitCaptureWindowTests(unittest.TestCase):
    def test_timing_sampling_and_reset(self):
        window = VisitCaptureWindow(3.0, 0.5)
        window.start(10.0)

        self.assertTrue(window.should_sample(10.0))
        window.add(None, 10.0)
        self.assertFalse(window.should_sample(10.2))
        self.assertTrue(window.should_sample(10.5))
        self.assertFalse(window.complete(12.99))
        self.assertTrue(window.complete(13.0))

        self.assertIsNone(window.finish())
        self.assertFalse(window.active)

    def test_selects_sharper_frame_when_confidence_is_similar(self):
        window = VisitCaptureWindow(3.0, 0.5)
        window.start(0.0)
        flat = np.full((100, 100, 3), 127, dtype=np.uint8)
        checker = np.indices((100, 100)).sum(axis=0) % 2
        sharp = np.repeat((checker * 255).astype(np.uint8)[:, :, None], 3, axis=2)

        window.add(detection(0.80, flat), 0.0)
        window.add(detection(0.78, sharp), 0.5)

        best = window.finish()
        self.assertIsNotNone(best)
        assert best is not None
        self.assertGreater(best.sharpness, 0)
        self.assertEqual(best.detection.confidence, 0.78)


if __name__ == "__main__":
    unittest.main()

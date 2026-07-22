import unittest

import numpy as np

from detect_bird import BirdDetection
from visit_capture import VisitCaptureWindow


def detection(confidence: float, crop: np.ndarray, bbox=None) -> BirdDetection:
    height, width = crop.shape[:2]
    return BirdDetection(
        confidence=confidence,
        bbox=bbox or (0, 0, width, height),
        crop=crop,
    )


class VisitCaptureWindowTests(unittest.TestCase):
    def test_timing_sampling_and_reset(self):
        window = VisitCaptureWindow(1.5, 0.15)
        window.start(10.0)

        self.assertTrue(window.should_sample(10.0))
        window.add(None, 10.0)
        self.assertFalse(window.should_sample(10.05))
        self.assertTrue(window.should_sample(10.15))
        self.assertFalse(window.complete(11.49))
        self.assertTrue(window.complete(11.5))

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

    def test_builds_wide_gallery_image_from_full_frame(self):
        window = VisitCaptureWindow(3.0, 0.5)
        window.start(0.0)
        frame = np.full((240, 320, 3), 40, dtype=np.uint8)
        frame[100:140, 140:180] = 200
        crop = frame[100:140, 140:180].copy()

        window.add(detection(0.9, crop, bbox=(140, 100, 40, 40)), 0.0, frame=frame)
        best = window.finish()

        self.assertIsNotNone(best)
        assert best is not None
        self.assertIsNotNone(best.gallery_image)
        assert best.gallery_image is not None
        # Gallery image should include far more than the 40x40 bird box.
        self.assertGreater(best.gallery_image.shape[1], 120)
        self.assertGreater(best.gallery_image.shape[0], 90)

    def test_uses_motion_fallback_when_yolo_misses(self):
        window = VisitCaptureWindow(3.0, 0.5)
        window.start(0.0)
        checker = np.indices((240, 320)).sum(axis=0) % 2
        frame = np.repeat(
            (checker * 255).astype(np.uint8)[:, :, None],
            3,
            axis=2,
        )

        window.add_motion_candidate(frame, (120, 80, 40, 50))
        best = window.finish()

        self.assertIsNotNone(best)
        assert best is not None
        self.assertEqual(best.source, "motion")
        self.assertEqual(best.detection.confidence, 0.0)
        self.assertIsNotNone(best.gallery_image)

    def test_prefers_yolo_candidate_over_motion_fallback(self):
        window = VisitCaptureWindow(3.0, 0.5)
        window.start(0.0)
        frame = np.full((200, 200, 3), 127, dtype=np.uint8)
        window.add_motion_candidate(frame, (50, 50, 40, 40))
        window.add(detection(0.30, frame[40:140, 40:140]), 0.5, frame=frame)

        best = window.finish()

        self.assertIsNotNone(best)
        assert best is not None
        self.assertEqual(best.source, "yolo")

    def test_rejects_canopy_sized_motion_fallback(self):
        window = VisitCaptureWindow(3.0, 0.5)
        window.start(0.0)
        frame = np.full((200, 200, 3), 127, dtype=np.uint8)
        # ~45% of the frame — foliage sheet, not a bird.
        window.add_motion_candidate(frame, (10, 10, 140, 130))
        self.assertIsNone(window.finish())


if __name__ == "__main__":
    unittest.main()

import unittest

import numpy as np

from detect_motion import MotionDetector


def solid_frame(value: int = 40, height: int = 240, width: int = 320) -> np.ndarray:
    return np.full((height, width, 3), value, dtype=np.uint8)


class MotionDetectorLeafFilterTests(unittest.TestCase):
    def test_concentrated_blob_in_roi_triggers(self):
        detector = MotionDetector(
            threshold=20.0,
            alpha=0.08,
            min_area_fraction=0.002,
            max_area_fraction=0.25,
            min_concentration=0.35,
            roi=(0.0, 0.0, 1.0, 1.0),
        )
        bg = solid_frame(40)
        self.assertFalse(detector.update(bg).triggered)

        bird = solid_frame(40)
        bird[100:150, 140:180] = 220
        result = detector.update(bird)

        self.assertTrue(result.triggered)
        self.assertIsNotNone(result.contour_bbox)
        self.assertGreaterEqual(result.concentration, 0.35)

    def test_scattered_leaf_like_motion_does_not_trigger(self):
        detector = MotionDetector(
            threshold=20.0,
            alpha=0.5,
            min_area_fraction=0.001,
            max_area_fraction=0.40,
            min_concentration=0.40,
            roi=(0.0, 0.0, 1.0, 1.0),
        )
        bg = solid_frame(40)
        detector.update(bg)

        leaves = solid_frame(40)
        # Many small separated blobs — wind in foliage.
        for y, x in (
            (20, 30),
            (40, 90),
            (25, 160),
            (55, 220),
            (80, 50),
            (90, 140),
            (70, 260),
            (110, 80),
            (120, 200),
            (35, 280),
        ):
            leaves[y : y + 12, x : x + 12] = 220

        result = detector.update(leaves)
        self.assertFalse(result.triggered)
        self.assertLess(result.concentration, 0.40)

    def test_motion_outside_roi_is_ignored(self):
        detector = MotionDetector(
            threshold=20.0,
            alpha=0.5,
            min_area_fraction=0.002,
            max_area_fraction=0.25,
            min_concentration=0.35,
            # Only the lower-center birdhouse band.
            roi=(0.25, 0.45, 0.50, 0.45),
        )
        bg = solid_frame(40)
        detector.update(bg)

        canopy = solid_frame(40)
        canopy[10:70, 40:280] = 220
        result = detector.update(canopy)
        self.assertFalse(result.triggered)


if __name__ == "__main__":
    unittest.main()

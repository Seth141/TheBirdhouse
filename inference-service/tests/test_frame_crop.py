import unittest

import numpy as np

from frame_crop import gallery_crop


class GalleryCropTests(unittest.TestCase):
    def test_gallery_crop_is_much_wider_than_bird_box(self):
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        frame[:, :] = (40, 80, 40)
        # Small bird near the feeder center.
        frame[220:260, 300:340] = (20, 20, 200)
        crop = gallery_crop(frame, (300, 220, 40, 40), min_coverage=0.42)

        self.assertGreaterEqual(crop.shape[1], int(640 * 0.40))
        self.assertGreaterEqual(crop.shape[0], int(480 * 0.30))
        # Landscape-ish for the 4:3 cards.
        self.assertGreater(crop.shape[1] / crop.shape[0], 1.1)

    def test_gallery_crop_stays_inside_frame(self):
        frame = np.zeros((240, 320, 3), dtype=np.uint8)
        crop = gallery_crop(frame, (10, 10, 20, 20))
        self.assertLessEqual(crop.shape[0], 240)
        self.assertLessEqual(crop.shape[1], 320)


if __name__ == "__main__":
    unittest.main()

import unittest
from unittest.mock import patch

from debounce import Debouncer


class DebouncerTests(unittest.TestCase):
    def test_blocks_same_label_until_window_expires(self):
        debouncer = Debouncer(60.0)
        with patch("debounce.time.monotonic", side_effect=[100.0, 140.0, 160.0]):
            self.assertTrue(debouncer.allow("Northern Cardinal"))
            self.assertFalse(debouncer.allow("Northern Cardinal"))
            self.assertTrue(debouncer.allow("Northern Cardinal"))

    def test_labels_have_independent_windows(self):
        debouncer = Debouncer(60.0)
        with patch("debounce.time.monotonic", side_effect=[100.0, 101.0]):
            self.assertTrue(debouncer.allow("Northern Cardinal"))
            self.assertTrue(debouncer.allow("House Finch"))


if __name__ == "__main__":
    unittest.main()

"""Small in-memory cooldown helper for a single inference worker."""

from __future__ import annotations

import time
from typing import Dict


class Debouncer:
    def __init__(self, window_seconds: float) -> None:
        self.window_seconds = window_seconds
        self._last: Dict[str, float] = {}

    def allow(self, label: str) -> bool:
        now = time.monotonic()
        previous = self._last.get(label)
        if previous is not None and (now - previous) < self.window_seconds:
            return False
        self._last[label] = now
        return True

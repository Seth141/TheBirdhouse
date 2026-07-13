"""RTSP frame capture with automatic reconnect on stream drop."""

from __future__ import annotations

import logging
import time
from collections.abc import Iterator
from typing import Optional

import cv2
import numpy as np

logger = logging.getLogger(__name__)


def frame_generator(
    rtsp_url: str,
    *,
    reconnect_delay_seconds: float = 2.0,
) -> Iterator[np.ndarray]:
    """
    Yield BGR frames forever. On open/read failure, release and reconnect.

    RTSP drops are expected with Wyze bridges — resilience is built in.
    """
    if not rtsp_url:
        raise ValueError("RTSP_URL is required")

    cap: Optional[cv2.VideoCapture] = None

    while True:
        if cap is None or not cap.isOpened():
            if cap is not None:
                cap.release()
            logger.info("Connecting to RTSP stream…")
            cap = cv2.VideoCapture(rtsp_url)
            # Prefer TCP for Railway-internal RTSP when the bridge supports it.
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            if not cap.isOpened():
                logger.warning(
                    "RTSP open failed; retrying in %.1fs", reconnect_delay_seconds
                )
                time.sleep(reconnect_delay_seconds)
                cap = None
                continue

        ret, frame = cap.read()
        if not ret or frame is None:
            logger.warning(
                "RTSP read failed; reconnecting in %.1fs", reconnect_delay_seconds
            )
            cap.release()
            cap = None
            time.sleep(reconnect_delay_seconds)
            continue

        yield frame

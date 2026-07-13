"""Environment-driven settings for the inference service."""

from __future__ import annotations

import os
from dataclasses import dataclass


def _float(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None or raw == "":
        return default
    return float(raw)


def _int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or raw == "":
        return default
    return int(raw)


def _bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None or raw == "":
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    rtsp_url: str
    supabase_url: str
    supabase_service_role_key: str
    motion_threshold: float
    detection_confidence_threshold: float
    classification_confidence_threshold: float
    debounce_seconds: float
    frame_skip: int
    reconnect_delay_seconds: float
    bird_model_path: str
    species_model_id: str
    enable_species_classifier: bool
    dry_run: bool
    host: str
    port: int


def load_settings() -> Settings:
    return Settings(
        rtsp_url=os.getenv("RTSP_URL", "").strip(),
        supabase_url=os.getenv("SUPABASE_URL", "").strip(),
        supabase_service_role_key=os.getenv(
            "SUPABASE_SERVICE_ROLE_KEY", ""
        ).strip(),
        motion_threshold=_float("MOTION_THRESHOLD", 25.0),
        detection_confidence_threshold=_float(
            "DETECTION_CONFIDENCE_THRESHOLD", 0.45
        ),
        classification_confidence_threshold=_float(
            "CLASSIFICATION_CONFIDENCE_THRESHOLD", 0.25
        ),
        debounce_seconds=_float("DEBOUNCE_SECONDS", 45.0),
        frame_skip=_int("FRAME_SKIP", 2),
        reconnect_delay_seconds=_float("RECONNECT_DELAY_SECONDS", 2.0),
        bird_model_path=os.getenv("BIRD_MODEL_PATH", "yolov8n.pt").strip(),
        species_model_id=os.getenv(
            "SPECIES_MODEL_ID",
            "chriamue/bird-species-classifier",
        ).strip(),
        enable_species_classifier=_bool("ENABLE_SPECIES_CLASSIFIER", True),
        dry_run=_bool("DRY_RUN", False),
        host=os.getenv("HOST", "0.0.0.0").strip(),
        port=_int("PORT", 8080),
    )

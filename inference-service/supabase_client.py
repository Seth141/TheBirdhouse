"""Supabase Storage upload + Postgres inserts for observations / species."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple

import cv2
import numpy as np

logger = logging.getLogger(__name__)


class SupabaseWriter:
    def __init__(
        self,
        *,
        url: str,
        service_role_key: str,
        bucket: str = "bird-images",
        dry_run: bool = False,
    ) -> None:
        self.url = url.rstrip("/")
        self.service_role_key = service_role_key
        self.bucket = bucket
        self.dry_run = dry_run
        self._client = None

    def connect(self) -> None:
        if self.dry_run:
            logger.info("DRY_RUN enabled — skipping Supabase client init")
            return
        if not self.url or not self.service_role_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")
        from supabase import create_client

        self._client = create_client(self.url, self.service_role_key)

    def _ensure(self) -> None:
        if self.dry_run:
            return
        if self._client is None:
            self.connect()

    def upload_image(self, image_bgr: np.ndarray, *, prefix: str = "obs") -> str:
        """Encode JPEG, upload to bird-images, return public URL."""
        ok, buf = cv2.imencode(".jpg", image_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
        if not ok:
            raise RuntimeError("Failed to encode JPEG")

        path = f"{prefix}/{datetime.now(timezone.utc).strftime('%Y/%m/%d')}/{uuid.uuid4().hex}.jpg"
        data = buf.tobytes()

        if self.dry_run:
            logger.info("DRY_RUN upload → %s (%d bytes)", path, len(data))
            return f"dry-run://{self.bucket}/{path}"

        self._ensure()
        assert self._client is not None
        self._client.storage.from_(self.bucket).upload(
            path,
            data,
            file_options={"content-type": "image/jpeg", "upsert": "false"},
        )
        public = self._client.storage.from_(self.bucket).get_public_url(path)
        return public

    def upsert_species(self, common_name: str) -> Optional[str]:
        """Insert or increment species; return species id."""
        if self.dry_run:
            logger.info("DRY_RUN upsert species %s", common_name)
            return None

        self._ensure()
        assert self._client is not None
        now = datetime.now(timezone.utc).isoformat()

        existing = (
            self._client.table("species")
            .select("id,total_sightings,first_seen_at")
            .eq("common_name", common_name)
            .limit(1)
            .execute()
        )

        if existing.data:
            row = existing.data[0]
            species_id = row["id"]
            total = int(row.get("total_sightings") or 0) + 1
            patch: Dict[str, Any] = {"total_sightings": total}
            if not row.get("first_seen_at"):
                patch["first_seen_at"] = now
            self._client.table("species").update(patch).eq("id", species_id).execute()
            return species_id

        inserted = (
            self._client.table("species")
            .insert(
                {
                    "common_name": common_name,
                    "first_seen_at": now,
                    "total_sightings": 1,
                }
            )
            .execute()
        )
        return inserted.data[0]["id"] if inserted.data else None

    def insert_observation(
        self,
        *,
        detected_label: str,
        confidence: float,
        image_url: str,
        species_id: Optional[str] = None,
        bbox: Optional[Dict[str, int]] = None,
    ) -> Optional[str]:
        payload = {
            "detected_label": detected_label,
            "confidence": confidence,
            "image_url": image_url,
            "species_id": species_id,
            "bbox": bbox,
            "observed_at": datetime.now(timezone.utc).isoformat(),
        }

        if self.dry_run:
            logger.info("DRY_RUN observation %s", payload)
            return None

        self._ensure()
        assert self._client is not None
        result = self._client.table("observations").insert(payload).execute()
        return result.data[0]["id"] if result.data else None

    def record_sighting(
        self,
        *,
        label: str,
        confidence: float,
        image_bgr: np.ndarray,
        bbox: Optional[Tuple[int, int, int, int]] = None,
    ) -> Dict[str, Any]:
        image_url = self.upload_image(image_bgr)
        species_id = self.upsert_species(label)
        bbox_json = None
        if bbox is not None:
            x, y, w, h = bbox
            bbox_json = {"x": x, "y": y, "w": w, "h": h}

        obs_id = self.insert_observation(
            detected_label=label,
            confidence=confidence,
            image_url=image_url,
            species_id=species_id,
            bbox=bbox_json,
        )
        return {
            "observation_id": obs_id,
            "species_id": species_id,
            "image_url": image_url,
            "label": label,
            "confidence": confidence,
        }

# Birdhouse Inference Service

Python/FastAPI worker that watches the Wyze RTSP stream (via wyze-bridge on Railway),
detects birds, classifies species, and writes rows to Supabase.

## Pipeline

1. Reconnecting RTSP capture (`capture.py`)
2. Motion opens a short visit window (`detect_motion.py`, `visit_capture.py`),
   ignoring windy leaf clutter via ROI + blob concentration filters
3. YOLO samples the window and selects its sharpest high-confidence bird crop
4. `houlette/birdclass-na` accepts a species only when confidence and margin pass
5. Supabase stores history and a FIFO queue of the six newest recognized images

## Local dry run

```bash
cd inference-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

export RTSP_URL="rtsp://..."
export SUPABASE_URL="https://xxxx.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="..."
export DRY_RUN=true   # skip Supabase writes while testing capture/detect
export ENABLE_SPECIES_CLASSIFIER=false  # optional: skip heavy HF download

uvicorn main:app --host 0.0.0.0 --port 8080
```

- `GET /health` — Railway healthcheck
- `GET /status` — last frame time, tallies, last error

## Railway

Production uses the existing Railway service for both wyze-bridge and inference:

1. Connect the existing service to this repository with the repository root.
2. Railway reads the root `railway.toml` and builds `Dockerfile.railway`.
3. Preserve the existing wyze-bridge variables and public domain on port 8888.
4. Add the Supabase variables from `.env.example`.
5. Leave `RTSP_URL=rtsp://127.0.0.1:8554/bird` so inference uses the bridge
   inside the same container.

The standalone `inference-service/Dockerfile` remains useful for local testing,
but production does not require a second Railway service.

## Model notes

- Bird detector defaults to `yolov8n.pt` (downloaded on first run)
- Species model defaults to `houlette/birdclass-na` (CC-BY-NC-4.0 weights)
- Uncertain and `OTHER` predictions are recorded as lightweight `Unknown bird`
  telemetry and never consume a Recent Moments image slot

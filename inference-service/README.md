# Birdhouse Inference Service

Python/FastAPI worker that watches the Wyze RTSP stream (via wyze-bridge on Railway),
detects birds, classifies species, and writes rows to Supabase.

## Pipeline

1. Reconnecting RTSP capture (`capture.py`)
2. Motion / presence via running-average frame diff (`detect_motion.py`)
3. YOLO COCO "bird" class filter (`detect_bird.py`)
4. Hugging Face species classifier (`classify_species.py`) — swappable
5. Upload crop + insert observation / upsert species (`supabase_client.py`)

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

1. New service → deploy from this repo with **Root Directory** = `inference-service`
2. Set env vars (see `.env.example`)
3. Use the private wyze-bridge RTSP URL, e.g.
   `rtsp://wyze-bridge.railway.internal:8554/<camera-name>`
4. Do **not** expose this service publicly unless you want `/status` on the internet

## Model notes

- Bird detector defaults to `yolov8n.pt` (downloaded on first run)
- Species model defaults to `chriamue/bird-species-classifier` — swap via `SPECIES_MODEL_ID`
- Interface is always `classify(image) -> (label, confidence)` so you can fine-tune later

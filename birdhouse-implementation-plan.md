# Birdhouse — Backend Implementation Plan

## Context for Cursor
The Next.js frontend already exists and is deployed on Vercel. This plan covers everything still needed: live camera stream ingestion, bird detection + species classification, the Supabase schema, and the Railway-hosted backend services. Execute the phases in order — each one is runnable/testable on its own before moving to the next.

## Architecture

```
Wyze Cam v3
    │ (cloud stream via Wyze account)
    ▼
[Railway] wyze-bridge service  →  internal RTSP URL
    │
    ▼
[Railway] inference service (Python/FastAPI)
    - polls RTSP stream
    - motion/presence detection (cheap, runs on every frame)
    - bird detector (runs only when motion detected)
    - species classifier (runs only when a bird is confirmed)
    - uploads cropped image to Supabase Storage
    - writes row to Supabase Postgres
    │
    ▼
Supabase (Postgres + Storage)
    │
    ▼
Next.js frontend on Vercel (reads Supabase directly via client SDK)
```

No Raspberry Pi, no Docker commands run locally — Railway builds containers from repos automatically.

---

## Phase 1 — Supabase schema

Create these tables via the Supabase SQL editor or a migration file.

```sql
create table species (
  id uuid primary key default gen_random_uuid(),
  common_name text not null,
  scientific_name text,
  first_seen_at timestamptz,
  total_sightings int default 0,
  created_at timestamptz default now()
);

create table observations (
  id uuid primary key default gen_random_uuid(),
  species_id uuid references species(id),
  detected_label text not null,       -- raw model output, before/without species match
  confidence numeric not null,
  image_url text not null,            -- Supabase Storage public/signed URL
  bbox jsonb,                         -- {x, y, w, h} crop coordinates, optional
  verified boolean default false,     -- for manual correction later, optional
  observed_at timestamptz not null default now(),
  created_at timestamptz default now()
);

create index on observations (observed_at desc);
create index on observations (species_id);
```

Create a Storage bucket named `bird-images` (public read, or use signed URLs — decide based on whether the frontend needs raw public links).

**Task for Cursor:**
- [x] Create these tables in Supabase (via SQL editor, or add a `supabase/migrations` file if the project already uses Supabase CLI migrations)
- [x] Create the `bird-images` storage bucket
- [x] Add a Supabase service-role key to Railway env vars later (used server-side only, never exposed to the frontend) — documented in `inference-service/.env.example` / `supabase/README.md`

---

## Phase 2 — Deploy wyze-bridge on Railway

1. Fork `mrlt8/docker-wyze-bridge` to your own GitHub account.
2. In Railway: New Project → Deploy from GitHub repo → select the fork.
3. Railway should auto-detect the repo's Dockerfile and build from it.
4. Set environment variables on this Railway service:
   - `WYZE_EMAIL`
   - `WYZE_PASSWORD`
   - `API_ID`
   - `API_KEY`
5. Expose ports:
   - **`8888` publicly** — HLS for the Next.js app (`https://<host>/<cam-name>/stream.m3u8`)
   - **`5000` optionally public** — bridge WebUI to confirm the cam streams
   - **Do not expose `8554` (RTSP)** — only the inference service on Railway's private network should use `rtsp://<service>.railway.internal:8554/<cam-name>`
6. Once deployed, open the WebUI and confirm the Wyze Cam v3 shows up and streams.
7. Copy the HLS URL into the frontend env (see below). Note the internal RTSP path for Phase 3.

### Live camera → frontend

Browsers play HLS, not RTSP. After the bridge is up:

```bash
NEXT_PUBLIC_CAMERA_PROTOCOL=hls
NEXT_PUBLIC_CAMERA_STREAM_URL=https://<railway-public-host>/<cam-name>/stream.m3u8
# If WB_AUTH is on (default): user `wb`, password = WB_API key from the WebUI
NEXT_PUBLIC_CAMERA_STREAM_USER=wb
NEXT_PUBLIC_CAMERA_STREAM_PASSWORD=<wb-api-key>
```

`cam-name` is the Wyze app camera name, lowercased with hyphens (e.g. `Bird House` → `bird-house`).

**Task for Cursor:**
- [x] App-side HLS wiring + attach fix (see `src/lib/camera/`). Phase 2 Railway deploy remains manual dashboard setup.

---

## Phase 3 — Inference service (FastAPI, new Railway service)

New repo (or new folder in the monorepo, deployed as its own Railway service).

### Responsibilities
1. Continuously read frames from the internal RTSP URL (`cv2.VideoCapture`), with automatic reconnect on stream drop (RTSP drops are common/expected).
2. Run a cheap motion/presence check on every frame (frame-diffing against a rolling background, or a lightweight object detector) to avoid running expensive inference constantly.
3. When motion is detected in the feeder region-of-interest, run a bird detector to confirm "is this actually a bird" (filters out leaves, squirrels, wind, etc.).
4. If a bird is confirmed, crop the frame and run the species classifier.
5. Upload the cropped image to Supabase Storage (`bird-images` bucket).
6. Insert a row into `observations` (and upsert/increment the matching row in `species`).
7. Debounce so a single bird visit doesn't generate dozens of near-duplicate rows (e.g., don't log again for the same species within an X-second window).

### Suggested file structure
```
inference-service/
  main.py              # FastAPI app, startup event kicks off the capture loop as a background task
  capture.py           # RTSP connection + reconnect logic
  detect_motion.py     # cheap presence/motion check
  detect_bird.py       # bird-vs-not-bird detector
  classify_species.py  # species classification model wrapper
  supabase_client.py   # upload image + insert rows
  config.py            # env vars: RTSP URL, Supabase keys, thresholds, debounce window
  requirements.txt
  Dockerfile           # optional; Railway can also use Nixpacks for a plain Python service
```

### Key environment variables
- `RTSP_URL` — internal Railway URL from Phase 2
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only, has write access
- `MOTION_THRESHOLD`, `DETECTION_CONFIDENCE_THRESHOLD`, `DEBOUNCE_SECONDS` — tunable

### `cv2.VideoCapture` reconnect pattern (known RTSP drops — build resilience in from day one)
```python
import cv2
import time

def frame_generator(rtsp_url):
    cap = cv2.VideoCapture(rtsp_url)
    while True:
        if not cap.isOpened():
            cap.release()
            time.sleep(2)
            cap = cv2.VideoCapture(rtsp_url)
            continue
        ret, frame = cap.read()
        if not ret:
            cap.release()
            time.sleep(2)
            cap = cv2.VideoCapture(rtsp_url)
            continue
        yield frame
```

**Task for Cursor:**
- [x] Scaffold the FastAPI service with the file structure above
- [x] Implement the reconnect-resilient capture loop as a background task started on FastAPI startup
- [x] Implement motion detection (start simple: frame differencing against a running average background)
- [x] Implement the Supabase upload + insert functions
- [x] Implement debounce logic (in-memory is fine for a single-instance hobby deployment)
- [x] Add a `/health` endpoint so Railway's health checks pass
- [x] Add a `/status` endpoint returning last-seen frame time, current species tally, etc. — useful for debugging without digging through logs

---

## Phase 4 — Bird detection + species classification model

Two-stage, both need to be picked/built before Phase 3 is fully functional:

1. **Presence/bird detector** — confirms a bird (vs. leaves/squirrel/shadow) is in frame. Start with an existing lightweight pretrained detector (e.g., a small YOLO model with a generic "bird" class from COCO) rather than training from scratch — COCO already includes a bird class, so this can be off-the-shelf.
2. **Species classifier** — fine-tuned model mapping cropped bird images to species names. Options, roughly in order of effort:
   - Use an existing bird-species classifier from Hugging Face if one covers North American species adequately.
   - Fine-tune a small ViT or EfficientNet on NABirds or CUB-200, narrowed to species actually possible in Sonoma County, CA.

**Task for Cursor:**
- [x] This phase is primarily a model-selection/training task outside of Cursor's typical scope — treat as a separate research spike. Once a model is chosen/trained, wrap it in `classify_species.py` with a simple `classify(image) -> (label, confidence)` interface so it's swappable later.

**Shipped defaults:** YOLO `yolov8n` (COCO bird class) + Hugging Face `chriamue/bird-species-classifier`, swappable via env (`BIRD_MODEL_PATH`, `SPECIES_MODEL_ID`).

---

## Phase 5 — Frontend integration (Next.js, already built)

Assuming the frontend already has its Supabase client configured:

- [x] Dashboard: query `observations` ordered by `observed_at desc`, join `species` for common name
- [x] Species page: group by `species_id`, show photo gallery + sighting count + first-seen date
- [x] Realtime (optional): use Supabase Realtime subscriptions on `observations` so the dashboard updates live when a new bird is logged, instead of polling
- [x] Use the public Supabase anon key client-side (read-only via RLS policies) — never expose the service-role key to the frontend

**Suggested Supabase RLS:**
- `observations` and `species`: public read access (anon key), write access restricted to service-role key only (used by the inference service, never the frontend)

---

## Execution order summary
1. Supabase schema + storage bucket
2. Deploy wyze-bridge to Railway, confirm stream works
3. Scaffold inference service, get raw frames flowing with the reconnect loop
4. Wire in motion detection, confirm it's not triggering on empty frames
5. Wire in bird detector (off-the-shelf), confirm it filters false positives
6. Wire in species classifier, confirm end-to-end write to Supabase
7. Connect frontend queries to real data
8. Tune debounce/thresholds based on real-world false positive/negative rate

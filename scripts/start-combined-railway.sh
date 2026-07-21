#!/usr/bin/env bash
set -euo pipefail

bridge_pid=""
inference_pid=""

shutdown() {
  trap - TERM INT EXIT
  [[ -n "$inference_pid" ]] && kill "$inference_pid" 2>/dev/null || true
  [[ -n "$bridge_pid" ]] && kill "$bridge_pid" 2>/dev/null || true
  wait 2>/dev/null || true
}

trap shutdown TERM INT EXIT

echo "[combined] Starting wyze-bridge"
(
  cd /app
  exec flask run --host=0.0.0.0
) &
bridge_pid=$!

echo "[combined] Starting bird inference worker"
(
  cd /bird-inference
  exec /opt/bird-venv/bin/uvicorn main:app \
    --host=127.0.0.1 \
    --port "${INFERENCE_PORT:-8080}"
) &
inference_pid=$!

# The container is unhealthy if either required process exits.
wait -n "$bridge_pid" "$inference_pid"
exit_code=$?
echo "[combined] A required process exited with status $exit_code"
exit "$exit_code"

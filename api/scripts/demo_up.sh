#!/usr/bin/env bash
# Bring up the whole Slaydar backend stack for a demo, idempotently:
#   DataHub (docker) -> glossary seed -> API (uvicorn :8000) -> cloudflared tunnel
# Prints the current public tunnel URL at the end (it changes every restart).
#
# Usage:
#   ./scripts/demo_up.sh           # bring stack up
#   ./scripts/demo_up.sh --seed    # also seed the demo closet
#
# Safe to re-run: each piece is skipped if already healthy.
set -euo pipefail

API_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="$API_DIR/.run"
mkdir -p "$RUN_DIR"
cd "$API_DIR"
# shellcheck disable=SC1091
source .venv/bin/activate

say() { printf "\n\033[1;36m==> %s\033[0m\n" "$1"; }

say "DataHub"
if curl -sf http://localhost:8080/health >/dev/null 2>&1; then
  echo "already up (:8080)"
else
  echo "starting (datahub docker quickstart — cached, ~1 min)..."
  datahub docker quickstart
fi

say "Glossary seed (idempotent)"
python -m scripts.seed_glossary >/dev/null 2>&1 && echo "seeded" || echo "seed skipped/failed (non-fatal)"

say "API (uvicorn :8000)"
if curl -sf http://localhost:8000/health >/dev/null 2>&1; then
  echo "already up (:8000)"
else
  nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > "$RUN_DIR/uvicorn.log" 2>&1 &
  echo "started (pid $!) — waiting for health..."
  for _ in $(seq 1 20); do curl -sf http://localhost:8000/health >/dev/null 2>&1 && break; sleep 1; done
  curl -sf http://localhost:8000/health >/dev/null 2>&1 && echo "healthy" || { echo "FAILED — see $RUN_DIR/uvicorn.log"; exit 1; }
fi

say "cloudflared tunnel"
URL_FILE="$RUN_DIR/tunnel_url.txt"
if pgrep -f "cloudflared tunnel --url http://localhost:8000" >/dev/null 2>&1; then
  echo "already running — reusing existing tunnel"
  URL="$(cat "$URL_FILE" 2>/dev/null || true)"
else
  : > "$RUN_DIR/cloudflared.log"
  nohup cloudflared tunnel --url http://localhost:8000 > "$RUN_DIR/cloudflared.log" 2>&1 &
  echo "started (pid $!) — waiting for URL..."
  sleep 6
  URL="$(grep -Eo 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' "$RUN_DIR/cloudflared.log" 2>/dev/null | head -1 || true)"
  [[ -n "$URL" ]] && echo "$URL" > "$URL_FILE"
fi

if [[ "${1:-}" == "--seed" ]]; then
  say "Seeding demo closet"
  python -m scripts.seed_demo
fi

say "READY"
echo "Local API:   http://localhost:8000  (docs: /docs)"
echo "DataHub UI:  http://localhost:9002  (datahub/datahub)"
if [[ -n "$URL" ]]; then
  echo "Public API:  $URL   <-- give this to Person B (update docs/api-contract.md)"
else
  echo "Public API:  (URL not captured yet — check $RUN_DIR/cloudflared.log)"
fi

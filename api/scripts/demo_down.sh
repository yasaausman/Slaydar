#!/usr/bin/env bash
# Tear down the API + tunnel (leaves DataHub running — that's the slow one to restart).
#   ./scripts/demo_down.sh          # stop API + tunnel
#   ./scripts/demo_down.sh --all    # also stop DataHub containers
set -uo pipefail

say() { printf "\n\033[1;36m==> %s\033[0m\n" "$1"; }

say "Stopping cloudflared tunnel"
pkill -f "cloudflared tunnel --url http://localhost:8000" && echo "stopped" || echo "not running"

say "Stopping API (:8000)"
lsof -ti tcp:8000 | xargs kill 2>/dev/null && echo "stopped" || echo "not running"

if [[ "${1:-}" == "--all" ]]; then
  say "Stopping DataHub"
  datahub docker quickstart --stop 2>/dev/null && echo "stopped" || echo "could not stop (is the CLI on PATH?)"
fi

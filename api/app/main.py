"""Slaydar backend — FastAPI app.

Endpoints implement docs/api-contract.md. Route handlers stay thin: they call
datahub_client functions for every DataHub write. Endpoint wiring is fleshed
out in the next step; this scaffold boots with health + config introspection.
"""
from __future__ import annotations

from fastapi import FastAPI

from .config import settings

app = FastAPI(title="Slaydar API", version="0.1.0")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "slaydar-api"}


@app.get("/config")
def config() -> dict:
    """Introspection for the demo — confirms which DataHub we're pointed at."""
    return {
        "datahub_gms_url": settings.datahub_gms_url,
        "platform": settings.platform,
        "env": settings.env,
        "thresholds": {
            "never_worn_days": settings.never_worn_days,
            "overworn_window_days": settings.overworn_window_days,
            "overworn_count": settings.overworn_count,
        },
    }

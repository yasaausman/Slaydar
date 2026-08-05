"""Slaydar backend — FastAPI app.

Endpoints implement docs/api-contract.md. Route handlers stay thin: they call
service functions, which own the DataHub writes (via datahub_client) and the
derived-field logic.
"""
from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import datahub_client as dh
from . import service, store
from .config import settings
from .models import (
    CheckinRequest,
    CreateGarmentRequest,
    Garment,
    LineageResponse,
    ResolveLinkRequest,
    TransferOwnerRequest,
)

app = FastAPI(title="Slaydar API", version="0.1.0")

# Person B's Next.js dev server calls this directly.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "slaydar-api", "datahub_dry_run": dh.is_dry_run()}


@app.get("/config")
def config() -> dict:
    return {
        "datahub_gms_url": settings.datahub_gms_url,
        "platform": settings.platform,
        "env": settings.env,
        "dry_run": dh.is_dry_run(),
        "thresholds": {
            "never_worn_days": settings.never_worn_days,
            "overworn_window_days": settings.overworn_window_days,
            "overworn_count": settings.overworn_count,
        },
    }


@app.post("/garments", response_model=Garment)
def create_garment(req: CreateGarmentRequest) -> Garment:
    return service.create_garment(req)


@app.get("/closet/{owner_id}", response_model=list[Garment])
def closet(owner_id: str) -> list[Garment]:
    return store.closet(owner_id)


@app.get("/garments/{garment_id}", response_model=Garment)
def get_garment(garment_id: str) -> Garment:
    g = store.get(garment_id)
    if g is None:
        raise HTTPException(status_code=404, detail=f"garment {garment_id} not found")
    return g


@app.post("/garments/{garment_id}/checkin", response_model=Garment)
def checkin(garment_id: str, req: CheckinRequest) -> Garment:
    g = service.checkin(garment_id, req.worn_date)
    if g is None:
        raise HTTPException(status_code=404, detail=f"garment {garment_id} not found")
    return g


@app.post("/garments/{garment_id}/transfer-owner", response_model=Garment)
def transfer_owner(garment_id: str, req: TransferOwnerRequest) -> Garment:
    g = service.transfer_owner(garment_id, req.new_owner_id)
    if g is None:
        raise HTTPException(status_code=404, detail=f"garment {garment_id} not found")
    return g


@app.get("/garments/{garment_id}/lineage", response_model=LineageResponse)
def lineage(garment_id: str) -> LineageResponse:
    result = service.lineage(garment_id)
    if result is None:
        raise HTTPException(status_code=404, detail=f"garment {garment_id} not found")
    return result


@app.post("/garments/resolve-link", response_model=Garment)
def resolve_link(req: ResolveLinkRequest) -> Garment:
    # Tier 2 — schema.org Product parsing. Not implemented yet.
    raise HTTPException(status_code=501, detail="resolve-link is Tier 2, not implemented")

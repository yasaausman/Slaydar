"""Domain logic: turns requests into DataHub emissions + derived fields.

Keeps main.py thin. Every DataHub write goes through datahub_client; the derived
fields (cost_per_wear, condition_score, deprecation/status) are computed here so
the rules are in one auditable place — Slaydar's roasts cite these numbers, so
they must be real and consistent.
"""
from __future__ import annotations

import uuid
from datetime import date, timedelta

from . import datahub_client as dh
from . import store
from .config import settings
from .models import (
    CreateGarmentRequest,
    Garment,
    GarmentStatus,
    LineageNode,
    LineageResponse,
)


def _new_garment_id(category: str) -> str:
    slug = category.strip().lower().replace(" ", "-") or "item"
    return f"{slug}-{uuid.uuid4().hex[:8]}"


def _condition_for(wear_count: int) -> int:
    raw = settings.starting_condition - settings.condition_drop_per_wear * wear_count
    return max(0, min(100, round(raw)))


def _staleness(garment_id: str, wear_count: int, today: date) -> tuple[GarmentStatus, bool, str]:
    """Return (status, deprecated, note) from the thresholds in config."""
    # Overworn: too many wears inside the rolling window.
    window_start = today - timedelta(days=settings.overworn_window_days)
    recent = [w for w in store.wears(garment_id) if w >= window_start]
    if len(recent) >= settings.overworn_count:
        note = f"overworn: {len(recent)} wears in {settings.overworn_window_days} days"
        return GarmentStatus.flagged_overworn, True, note

    # Never-worn: catalogued long ago, still unworn.
    cataloged = store.cataloged_on(garment_id)
    if wear_count == 0 and cataloged is not None:
        if (today - cataloged).days >= settings.never_worn_days:
            note = f"never worn: catalogued {(today - cataloged).days} days ago, 0 wears"
            return GarmentStatus.flagged_unworn, True, note

    return GarmentStatus.active, False, ""


def create_garment(req: CreateGarmentRequest) -> Garment:
    garment_id = _new_garment_id(req.category)
    cataloged = req.cataloged_date or date.today()

    garment = Garment(
        garment_id=garment_id,
        owner_id=req.owner_id,
        category=req.category,
        color=req.color,
        material=req.material,
        brand=req.brand,
        style_tags=req.style_tags,
        wear_count=0,
        last_worn_date=None,
        cost_per_wear=None,
        condition_score=settings.starting_condition,
        status=GarmentStatus.active,
    )

    store.put(garment, cost=req.cost)
    store.set_cataloged(garment_id, cataloged)

    # DataHub writes: Dataset props + Ownership + GlossaryTerms.
    dh.emit_properties(garment_id, _props(garment))
    dh.emit_ownership(garment_id, req.owner_id)
    dh.emit_glossary_terms(garment_id, req.style_tags)
    return garment


def checkin(garment_id: str, worn_date: date) -> Garment | None:
    garment = store.get(garment_id)
    if garment is None:
        return None

    store.add_wear(garment_id, worn_date)
    garment.wear_count += 1
    garment.last_worn_date = max(worn_date, garment.last_worn_date or worn_date)
    garment.condition_score = _condition_for(garment.wear_count)

    cost = store.cost_of(garment_id)
    garment.cost_per_wear = round(cost / garment.wear_count, 2) if cost else None

    status, deprecated, note = _staleness(garment_id, garment.wear_count, worn_date)
    garment.status = status

    store.put(garment)
    dh.emit_properties(garment_id, _props(garment))
    dh.emit_deprecation(garment_id, deprecated, note)
    return garment


def transfer_owner(garment_id: str, new_owner_id: str) -> Garment | None:
    """New ownership period => new dataset URN, linked to the old one by lineage.

    The old garment is marked listed-for-resale (its record freezes as history);
    the returned garment is the fresh URN under the new owner.
    """
    old = store.get(garment_id)
    if old is None:
        return None

    old.status = GarmentStatus.listed_for_resale
    store.put(old)
    dh.emit_properties(old.garment_id, _props(old))

    new_id = _new_garment_id(old.category)
    new_garment = Garment(
        garment_id=new_id,
        owner_id=new_owner_id,
        category=old.category,
        color=old.color,
        material=old.material,
        brand=old.brand,
        style_tags=old.style_tags,
        wear_count=old.wear_count,  # carry provenance — the wear history is the whole point
        last_worn_date=old.last_worn_date,
        cost_per_wear=None,  # cost basis resets for the new owner
        condition_score=old.condition_score,
        status=GarmentStatus.active,
    )
    store.put(new_garment)
    store.set_parent(new_id, garment_id)
    store.set_cataloged(new_id, date.today())

    dh.emit_properties(new_id, _props(new_garment))
    dh.emit_ownership(new_id, new_owner_id)
    dh.emit_glossary_terms(new_id, old.style_tags)
    dh.emit_lineage(new_id, garment_id)  # UpstreamLineage edge -> demo graph
    return new_garment


def lineage(garment_id: str) -> LineageResponse | None:
    if store.get(garment_id) is None:
        return None
    chain: list[LineageNode] = []
    cursor: str | None = garment_id
    seen: set[str] = set()
    while cursor and cursor not in seen:
        seen.add(cursor)
        g = store.get(cursor)
        if g is None:
            break
        chain.append(LineageNode(garment_id=g.garment_id, owner_id=g.owner_id, urn=dh.garment_urn(g.garment_id)))
        cursor = store.parent_of(cursor)
    return LineageResponse(garment_id=garment_id, chain=chain)


def _props(g: Garment) -> dict[str, object]:
    """The customProperties string map written to DataHub for a garment."""
    return {
        "category": g.category,
        "color": g.color,
        "material": g.material,
        "brand": g.brand,
        "wear_count": g.wear_count,
        "last_worn_date": g.last_worn_date.isoformat() if g.last_worn_date else None,
        "cost_per_wear": g.cost_per_wear,
        "condition_score": g.condition_score,
        "status": g.status.value,
    }

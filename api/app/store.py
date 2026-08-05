"""In-process index of garments.

DataHub search is eventually-consistent, which is awkward for a live demo where
you catalog an item and immediately want it in `/closet`. So we keep a local
authoritative map of the garment state we've emitted. DataHub remains the system
of record for the demo's lineage/ownership story; this is a read cache + the
source for recomputing derived fields (cost_per_wear, condition, deprecation).

Not persistent — fine for a hackathon. Reseed from the seed script on restart.
"""
from __future__ import annotations

from datetime import date

from .models import Garment

# garment_id -> Garment
_garments: dict[str, Garment] = {}
# garment_id -> cost basis (for cost_per_wear); kept out of the public shape
_cost_basis: dict[str, float] = {}
# garment_id -> upstream garment_id (previous ownership period), for lineage walks
_parents: dict[str, str] = {}
# garment_id -> catalog date, for the never-worn staleness rule
_cataloged: dict[str, date] = {}
# garment_id -> list of worn dates, for the overworn rolling-window rule
_wears: dict[str, list[date]] = {}


def put(garment: Garment, cost: float | None = None) -> None:
    _garments[garment.garment_id] = garment
    if cost is not None:
        _cost_basis[garment.garment_id] = cost


def set_parent(garment_id: str, upstream_garment_id: str) -> None:
    _parents[garment_id] = upstream_garment_id


def parent_of(garment_id: str) -> str | None:
    return _parents.get(garment_id)


def set_cataloged(garment_id: str, when: date) -> None:
    _cataloged[garment_id] = when


def cataloged_on(garment_id: str) -> date | None:
    return _cataloged.get(garment_id)


def add_wear(garment_id: str, when: date) -> None:
    _wears.setdefault(garment_id, []).append(when)


def wears(garment_id: str) -> list[date]:
    return _wears.get(garment_id, [])


def get(garment_id: str) -> Garment | None:
    return _garments.get(garment_id)


def cost_of(garment_id: str) -> float | None:
    return _cost_basis.get(garment_id)


def set_cost(garment_id: str, cost: float | None) -> None:
    if cost is not None:
        _cost_basis[garment_id] = cost


def closet(owner_id: str) -> list[Garment]:
    return [g for g in _garments.values() if g.owner_id == owner_id]


def all_garments() -> list[Garment]:
    return list(_garments.values())

"""In-process index of garments.

DataHub search is eventually-consistent, which is awkward for a live demo where
you catalog an item and immediately want it in `/closet`. So we keep a local
authoritative map of the garment state we've emitted. DataHub remains the system
of record for the demo's lineage/ownership story; this is a read cache + the
source for recomputing derived fields (cost_per_wear, condition, deprecation).

Not persistent — fine for a hackathon. Reseed from the seed script on restart.
"""
from __future__ import annotations

from .models import Garment

# garment_id -> Garment
_garments: dict[str, Garment] = {}
# garment_id -> cost basis (for cost_per_wear); kept out of the public shape
_cost_basis: dict[str, float] = {}


def put(garment: Garment, cost: float | None = None) -> None:
    _garments[garment.garment_id] = garment
    if cost is not None:
        _cost_basis[garment.garment_id] = cost


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

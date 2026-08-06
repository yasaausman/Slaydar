"""Pydantic models matching the garment contract in docs/api-contract.md.

Keep these in lockstep with that doc — it is the source of truth Person B
builds against.
"""
from __future__ import annotations

from datetime import date
from enum import Enum

from pydantic import BaseModel, Field


class GarmentStatus(str, Enum):
    active = "active"
    flagged_overworn = "flagged-overworn"
    flagged_unworn = "flagged-unworn"
    listed_for_resale = "listed-for-resale"


class Garment(BaseModel):
    """The shared garment shape returned by every endpoint."""

    garment_id: str
    owner_id: str
    category: str
    color: str
    material: str
    brand: str | None = None
    style_tags: list[str] = Field(default_factory=list)
    wear_count: int = 0
    last_worn_date: date | None = None
    cost_per_wear: float | None = None
    condition_score: int = 100
    status: GarmentStatus = GarmentStatus.active


class CreateGarmentRequest(BaseModel):
    """Vision-extracted fields + owner_id. POST /garments."""

    owner_id: str
    category: str
    color: str
    material: str
    brand: str | None = None
    style_tags: list[str] = Field(default_factory=list)
    # Optional so cost_per_wear can be computed; not part of the returned shape directly.
    cost: float | None = None
    cataloged_date: date | None = None


class CheckinRequest(BaseModel):
    worn_date: date


class TransferOwnerRequest(BaseModel):
    new_owner_id: str


class EvaluateStalenessRequest(BaseModel):
    owner_id: str | None = None


class ResolveLinkRequest(BaseModel):
    url: str


class LineageNode(BaseModel):
    garment_id: str
    owner_id: str
    urn: str


class LineageResponse(BaseModel):
    garment_id: str
    chain: list[LineageNode]

"""All DataHub writes for Slaydar live here.

Every mutation is a MetadataChangeProposalWrapper (MCP) emitted through the
`acryl-datahub` SDK. Route handlers never touch the SDK directly — they call
the functions in this module. That keeps the emitters unit-testable against a
local DataHub without the frontend, and keeps the aspect mapping
(docs/datahub-schema.md) in one place.

If the SDK isn't installed or DataHub is unreachable, the client falls back to
**dry-run mode**: it logs the MCP it *would* emit and returns cleanly, so the
API still boots for frontend integration.
"""
from __future__ import annotations

import logging
from datetime import date, datetime, timezone

from . import glossary
from .config import settings

log = logging.getLogger("slaydar.datahub")

# --- Soft SDK import: never let a missing/broken SDK stop the API booting. ---
try:
    from datahub.emitter.mce_builder import make_dataset_urn, make_user_urn
    from datahub.emitter.mcp import MetadataChangeProposalWrapper
    from datahub.emitter.rest_emitter import DatahubRestEmitter
    from datahub.metadata.schema_classes import (
        AuditStampClass,
        DatasetPropertiesClass,
        DeprecationClass,
        GlossaryTermAssociationClass,
        GlossaryTermInfoClass,
        GlossaryTermsClass,
        OwnerClass,
        OwnershipClass,
        OwnershipTypeClass,
        UpstreamClass,
        UpstreamLineageClass,
    )

    _SDK_AVAILABLE = True
except Exception as exc:  # pragma: no cover - import guard
    _SDK_AVAILABLE = False
    log.warning("acryl-datahub SDK unavailable (%s) — running in dry-run mode", exc)


# --------------------------------------------------------------------------- #
# Emitter (lazy, cached). Falls back to dry-run if DataHub can't be reached.
# --------------------------------------------------------------------------- #
_emitter = None
_dry_run = (not _SDK_AVAILABLE) or settings.force_dry_run


def _get_emitter():
    """Return a live REST emitter, or None if we're in dry-run mode."""
    global _emitter, _dry_run
    if _dry_run:
        return None
    if _emitter is None:
        try:
            _emitter = DatahubRestEmitter(
                gms_server=settings.datahub_gms_url,
                token=settings.datahub_token,
            )
            _emitter.test_connection()
            log.info("Connected to DataHub GMS at %s", settings.datahub_gms_url)
        except Exception as exc:
            log.warning("DataHub unreachable (%s) — switching to dry-run mode", exc)
            _dry_run = True
            _emitter = None
    return _emitter


def _emit(mcp) -> None:
    """Emit one MCP, or log it in dry-run mode."""
    emitter = _get_emitter()
    if emitter is None:
        log.info("[dry-run] would emit MCP: entity=%s aspect=%s", mcp.entityUrn, type(mcp.aspect).__name__)
        return
    emitter.emit(mcp)


def is_dry_run() -> bool:
    # Trigger a connection attempt so callers get an accurate answer.
    _get_emitter()
    return _dry_run


# --------------------------------------------------------------------------- #
# Read side — used to rehydrate the in-process store after an API restart.
# --------------------------------------------------------------------------- #
_graph = None


def _get_graph():
    global _graph
    if _graph is None:
        from datahub.ingestion.graph.client import DataHubGraph, DataHubGraphConfig

        _graph = DataHubGraph(DataHubGraphConfig(server=settings.datahub_gms_url, token=settings.datahub_token))
    return _graph


def list_garment_urns() -> list[str]:
    """All Slaydar dataset URNs currently in DataHub (empty in dry-run)."""
    if is_dry_run():
        return []
    graph = _get_graph()
    return list(graph.get_urns_by_filter(platform=settings.platform, entity_types=["dataset"]))


def read_garment(urn: str) -> dict | None:
    """Reconstruct a garment's fields from its DataHub aspects.

    Returns a dict of {props, owner_id, style_tags, cataloged_date, parent} or
    None if the entity has no DatasetProperties (not one of ours / incomplete).
    """
    graph = _get_graph()
    props = graph.get_aspect(urn, DatasetPropertiesClass)
    if props is None:
        return None
    cp = props.customProperties or {}

    own = graph.get_aspect(urn, OwnershipClass)
    owner_id = own.owners[0].owner.split(":")[-1] if own and own.owners else "unknown"

    terms = graph.get_aspect(urn, GlossaryTermsClass)
    style_tags = [t.urn.split(".")[-1] for t in terms.terms] if terms and terms.terms else []

    lin = graph.get_aspect(urn, UpstreamLineageClass)
    parent = lin.upstreams[0].dataset.split(",")[1] if lin and lin.upstreams else None

    return {
        "garment_id": props.name or urn.split(",")[1],
        "owner_id": owner_id,
        "style_tags": style_tags,
        "custom": cp,
        "parent": parent,
    }


# --------------------------------------------------------------------------- #
# URN helpers
# --------------------------------------------------------------------------- #
def garment_urn(garment_id: str) -> str:
    """urn:li:dataset:(urn:li:dataPlatform:slaydar,<garment_id>,PROD)"""
    if _SDK_AVAILABLE:
        return make_dataset_urn(platform=settings.platform, name=garment_id, env=settings.env)
    return f"urn:li:dataset:(urn:li:dataPlatform:{settings.platform},{garment_id},{settings.env})"


def _user_urn(owner_id: str) -> str:
    if _SDK_AVAILABLE:
        return make_user_urn(owner_id)
    return f"urn:li:corpuser:{owner_id}"


def _now_stamp():
    millis = int(datetime.now(timezone.utc).timestamp() * 1000)
    if _SDK_AVAILABLE:
        return AuditStampClass(time=millis, actor="urn:li:corpuser:slaydar")
    return millis


# --------------------------------------------------------------------------- #
# Aspect emitters — each maps a garment concept to a built-in DataHub aspect.
# --------------------------------------------------------------------------- #
def emit_properties(garment_id: str, props: dict[str, object]) -> None:
    """DatasetProperties.customProperties — the mutable stat map.

    category/color/material/brand/wear_count/last_worn_date/cost_per_wear/
    condition_score/status all live here as strings.
    """
    urn = garment_urn(garment_id)
    string_props = {k: ("" if v is None else str(v)) for k, v in props.items()}
    if _dry_run or not _SDK_AVAILABLE:
        _emit(_FakeMcp(urn, "DatasetProperties", string_props))
        return
    mcp = MetadataChangeProposalWrapper(
        entityUrn=urn,
        aspect=DatasetPropertiesClass(name=garment_id, customProperties=string_props),
    )
    _emit(mcp)


def emit_ownership(garment_id: str, owner_id: str) -> None:
    """Ownership — set on create, reassigned on transfer."""
    urn = garment_urn(garment_id)
    if _dry_run or not _SDK_AVAILABLE:
        _emit(_FakeMcp(urn, "Ownership", {"owner": owner_id}))
        return
    mcp = MetadataChangeProposalWrapper(
        entityUrn=urn,
        aspect=OwnershipClass(
            owners=[OwnerClass(owner=_user_urn(owner_id), type=OwnershipTypeClass.DATAOWNER)]
        ),
    )
    _emit(mcp)


def ensure_terms(style_tags: list[str]) -> None:
    """Upsert a GlossaryTermInfo for each tag so associations never dangle.

    The seed script covers the starter vocabulary, but the vision agent can emit
    tags outside it (e.g. "y2k", "cottagecore"). Creating the term on demand —
    idempotent in DataHub — keeps GlossaryTerms writes valid for anything Gemini
    returns, and the glossary grows with real usage.
    """
    if _dry_run or not _SDK_AVAILABLE:
        return
    for tag in style_tags:
        slug = glossary.slugify(tag)
        _emit(MetadataChangeProposalWrapper(
            entityUrn=glossary.term_urn(tag),
            aspect=GlossaryTermInfoClass(
                definition=f"Style tag: {slug}",
                name=slug,
                termSource="INTERNAL",
                parentNode=glossary.node_urn(),
            ),
        ))


def emit_glossary_terms(garment_id: str, style_tags: list[str]) -> None:
    """GlossaryTerms — style tags. Auto-ensures each term exists first."""
    if not style_tags:
        return
    urn = garment_urn(garment_id)
    if _dry_run or not _SDK_AVAILABLE:
        _emit(_FakeMcp(urn, "GlossaryTerms", {"terms": [glossary.slugify(t) for t in style_tags]}))
        return
    ensure_terms(style_tags)
    mcp = MetadataChangeProposalWrapper(
        entityUrn=urn,
        aspect=GlossaryTermsClass(
            terms=[GlossaryTermAssociationClass(urn=glossary.term_urn(t)) for t in style_tags],
            auditStamp=_now_stamp(),
        ),
    )
    _emit(mcp)


def emit_deprecation(garment_id: str, deprecated: bool, note: str = "") -> None:
    """Deprecation — DataHub's native staleness aspect (overworn / never-worn)."""
    urn = garment_urn(garment_id)
    if _dry_run or not _SDK_AVAILABLE:
        _emit(_FakeMcp(urn, "Deprecation", {"deprecated": deprecated, "note": note}))
        return
    mcp = MetadataChangeProposalWrapper(
        entityUrn=urn,
        aspect=DeprecationClass(deprecated=deprecated, note=note, actor="urn:li:corpuser:slaydar"),
    )
    _emit(mcp)


def emit_lineage(garment_id: str, upstream_garment_id: str) -> None:
    """UpstreamLineage — chains a new ownership-period URN to the previous one."""
    urn = garment_urn(garment_id)
    up_urn = garment_urn(upstream_garment_id)
    if _dry_run or not _SDK_AVAILABLE:
        _emit(_FakeMcp(urn, "UpstreamLineage", {"upstream": up_urn}))
        return
    mcp = MetadataChangeProposalWrapper(
        entityUrn=urn,
        aspect=UpstreamLineageClass(upstreams=[UpstreamClass(dataset=up_urn, type="COPY")]),
    )
    _emit(mcp)


# --------------------------------------------------------------------------- #
# Dry-run stand-in so the log line is identical shape to a real MCP.
# --------------------------------------------------------------------------- #
class _FakeMcp:
    def __init__(self, entity_urn: str, aspect_name: str, payload: dict):
        self.entityUrn = entity_urn
        self.aspect = type(aspect_name, (), {"__init__": lambda s: None})()
        self._payload = payload

    def __repr__(self) -> str:  # pragma: no cover
        return f"<MCP {self.entityUrn} {type(self.aspect).__name__} {self._payload}>"

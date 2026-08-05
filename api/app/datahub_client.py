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
_dry_run = not _SDK_AVAILABLE


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


def _term_urn(tag: str) -> str:
    # Glossary term URNs are seeded by scripts/seed_glossary.py under this node.
    slug = tag.strip().lower().replace(" ", "_")
    return f"urn:li:glossaryTerm:slaydar.{slug}"


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


def emit_glossary_terms(garment_id: str, style_tags: list[str]) -> None:
    """GlossaryTerms — style tags. Terms must be seeded first (seed_glossary.py)."""
    if not style_tags:
        return
    urn = garment_urn(garment_id)
    if _dry_run or not _SDK_AVAILABLE:
        _emit(_FakeMcp(urn, "GlossaryTerms", {"terms": style_tags}))
        return
    mcp = MetadataChangeProposalWrapper(
        entityUrn=urn,
        aspect=GlossaryTermsClass(
            terms=[GlossaryTermAssociationClass(urn=_term_urn(t)) for t in style_tags],
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

"""One-time seed: create the Slaydar glossary node + style terms.

Run this once against the shared DataHub before Day 1 so `GlossaryTerms` aspect
writes from datahub_client don't reference missing term URNs. (datahub_client
also auto-ensures unknown terms at write time, so this is really just to
pre-populate the canonical starter vocabulary and the node itself.)

    cd api && source .venv/bin/activate
    python -m scripts.seed_glossary

Vocabulary + URN scheme come from app.glossary — the single source of truth.
In dry-run mode (no live DataHub / SDK), it prints what it would create.
"""
from __future__ import annotations

import sys

from app import glossary
from app.config import settings


def main() -> int:
    try:
        from datahub.emitter.mcp import MetadataChangeProposalWrapper
        from datahub.emitter.rest_emitter import DatahubRestEmitter
        from datahub.metadata.schema_classes import (
            GlossaryNodeInfoClass,
            GlossaryTermInfoClass,
        )
    except Exception as exc:
        print(f"[dry-run] SDK unavailable ({exc}). Would create:")
        print(f"  node  {glossary.node_urn()}  ('{glossary.NODE_NAME}')")
        for t in glossary.STYLE_TERMS:
            print(f"  term  {glossary.term_urn(t)}")
        return 0

    emitter = DatahubRestEmitter(gms_server=settings.datahub_gms_url, token=settings.datahub_token)
    try:
        emitter.test_connection()
    except Exception as exc:
        print(f"[dry-run] DataHub unreachable at {settings.datahub_gms_url} ({exc}).")
        return 0

    # Glossary node.
    emitter.emit(MetadataChangeProposalWrapper(
        entityUrn=glossary.node_urn(),
        aspect=GlossaryNodeInfoClass(definition="Slaydar wardrobe style tags", name=glossary.NODE_NAME),
    ))
    # Terms under it.
    for tag in glossary.STYLE_TERMS:
        emitter.emit(MetadataChangeProposalWrapper(
            entityUrn=glossary.term_urn(tag),
            aspect=GlossaryTermInfoClass(
                definition=f"Style tag: {tag}",
                name=tag,
                termSource="INTERNAL",
                parentNode=glossary.node_urn(),
            ),
        ))
        print(f"seeded {glossary.term_urn(tag)}")

    print(f"\nSeeded glossary node + {len(glossary.STYLE_TERMS)} terms to {settings.datahub_gms_url} ✅")
    return 0


if __name__ == "__main__":
    sys.exit(main())

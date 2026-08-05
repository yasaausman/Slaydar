"""One-time seed: create the Slaydar glossary node + style terms.

Run this once against the shared DataHub before Day 1 so `GlossaryTerms` aspect
writes from datahub_client don't reference missing term URNs.

    cd api && source .venv/bin/activate
    python -m scripts.seed_glossary

Term URNs match datahub_client._term_urn(): urn:li:glossaryTerm:slaydar.<slug>
In dry-run mode (no live DataHub / SDK), it prints what it would create.
"""
from __future__ import annotations

import sys

from app.config import settings

# The starter style vocabulary. Keep small — it just has to exist so writes land.
STYLE_TERMS = [
    "casual",
    "formal",
    "streetwear",
    "athleisure",
    "business",
    "loungewear",
    "outerwear",
    "evening",
]

NODE_ID = "slaydar"
NODE_NAME = "Slaydar Style Tags"


def _term_urn(slug: str) -> str:
    return f"urn:li:glossaryTerm:{NODE_ID}.{slug}"


def _node_urn() -> str:
    return f"urn:li:glossaryNode:{NODE_ID}"


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
        print(f"  node  {_node_urn()}  ('{NODE_NAME}')")
        for t in STYLE_TERMS:
            print(f"  term  {_term_urn(t)}")
        return 0

    emitter = DatahubRestEmitter(gms_server=settings.datahub_gms_url, token=settings.datahub_token)
    try:
        emitter.test_connection()
    except Exception as exc:
        print(f"[dry-run] DataHub unreachable at {settings.datahub_gms_url} ({exc}).")
        return 0

    # Glossary node.
    emitter.emit(MetadataChangeProposalWrapper(
        entityUrn=_node_urn(),
        aspect=GlossaryNodeInfoClass(definition="Slaydar wardrobe style tags", name=NODE_NAME),
    ))
    # Terms under it.
    for slug in STYLE_TERMS:
        emitter.emit(MetadataChangeProposalWrapper(
            entityUrn=_term_urn(slug),
            aspect=GlossaryTermInfoClass(
                definition=f"Style tag: {slug}",
                name=slug,
                termSource="INTERNAL",
                parentNode=_node_urn(),
            ),
        ))
        print(f"seeded {_term_urn(slug)}")

    print(f"\nSeeded glossary node + {len(STYLE_TERMS)} terms to {settings.datahub_gms_url} ✅")
    return 0


if __name__ == "__main__":
    sys.exit(main())

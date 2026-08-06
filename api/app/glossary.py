"""Shared glossary vocabulary + URN helpers.

Single source of truth for the style-tag glossary, imported by both
datahub_client (association + auto-ensure) and scripts/seed_glossary (bulk seed)
so the node id and term URN scheme can never drift apart.
"""
from __future__ import annotations

NODE_ID = "slaydar"
NODE_NAME = "Slaydar Style Tags"

# The seeded starter vocabulary. Vision tags outside this set are still accepted —
# datahub_client.ensure_terms upserts them under the same node so associations
# never dangle.
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


def slugify(tag: str) -> str:
    return tag.strip().lower().replace(" ", "_").replace("-", "_")


def term_urn(tag: str) -> str:
    return f"urn:li:glossaryTerm:{NODE_ID}.{slugify(tag)}"


def node_urn() -> str:
    return f"urn:li:glossaryNode:{NODE_ID}"

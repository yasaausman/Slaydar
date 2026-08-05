# Slaydar

Wear-history-backed wardrobe agent for "Build with DataHub: The Agent Hackathon" (deadline Aug 10, 2026). Full plan: [PLAN.md](PLAN.md).

## What this is
Catalogs a closet from photos, tracks real wear history, and turns that history into a verified trust signal on resale — by modeling garments as DataHub entities (ownership, usage stats, deprecation/staleness, lineage), not just rows in a database. See [PLAN.md](PLAN.md) §3 for the exact DataHub aspect mapping.

## Repo layout
- `/web` — Next.js (TypeScript) frontend + runtime Claude agent calls (vision extraction, check-in matching, roast generation). Owned by Person B. See `web/CLAUDE.md`.
- `/api` — FastAPI service wrapping the DataHub Python SDK (`acryl-datahub`). Owned by Person A. See `api/CLAUDE.md`.
- `docs/api-contract.md` — the REST contract between `/web` and `/api`. Update this in the same PR as any endpoint change — it's the source of truth both people's Claude Code sessions should defer to.
- `docs/datahub-schema.md` — the DataHub entity/aspect schema (Dataset URNs, which aspects carry which fields).

## Non-negotiables
- Slaydar's roast must always cite a real stat from DataHub; never invent a number; never comment on the user's body/fit/looks. Full locked system prompt in [PLAN.md](PLAN.md) §5 — use it verbatim.
- Garments are DataHub `Dataset` entities, not a custom entity type (no time to modify DataHub source this week).
- Ownership history across resale = a new dataset URN per ownership period, linked by `UpstreamLineage` — chosen specifically so the DataHub lineage graph UI is demoable live.

## Shared DataHub instance
Both of you point at one shared DataHub instance (not separate local ones) so demo data stays consistent. URL/access details: TBD — whoever stands it up on Day 0, note it in `docs/datahub-schema.md`.

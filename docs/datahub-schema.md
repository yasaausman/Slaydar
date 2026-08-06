# DataHub schema

Status: **draft, lock on Day 0 (Aug 4).** Owned by Person A; update here whenever the aspect mapping changes.

## Shared instance
- Host/URL: **running locally on Person A's machine** via `datahub docker quickstart` (DataHub **v1.7.0**). UI: http://localhost:9002 (`datahub`/`datahub`), GMS: http://localhost:8080.
  - ⚠️ `localhost` is only reachable from Person A's machine. Before the integrated demo, expose it (ngrok/Tailscale) or move to a shared VM so Person B can point at it too. Until then Person B integrates against the API in dry-run.
  - Restart after a reboot with `datahub docker quickstart` (images are cached — comes up in <1 min).
- GMS: `:8080`, UI: `:9002` (defaults for `datahub docker quickstart`)
- Platform URN used for all garments: `urn:li:dataPlatform:slaydar`
- Requires Python **3.10–3.12** for the SDK/CLI (not 3.13+); local venv uses 3.12.
- **Verified end-to-end (Day 1):** create → checkin → transfer-owner emits real MCPs; `Ownership`, `DatasetProperties`, `GlossaryTerms`, `Deprecation`, and `UpstreamLineage` all confirmed present in GMS. Lineage graph renders in the UI.

## Entity choice
Garments are modeled as DataHub **Dataset** entities (no custom entity type — out of scope for a 6-day build). URN shape:

```
urn:li:dataset:(urn:li:dataPlatform:slaydar,<garment_id>,PROD)
```

## Aspect mapping

| Field / concept | Aspect | How it's set |
|---|---|---|
| owner_id | `Ownership` | set on create; reassigned on `transfer-owner` (new URN, see below) |
| style_tags | `GlossaryTerms` | seed glossary terms once (casual/formal/streetwear/...) via a one-time seed script before Day 1 |
| category, color, material, brand, wear_count, last_worn_date, cost_per_wear, condition_score | `DatasetProperties.customProperties` | string map, updated via MCP on create/checkin |
| overworn / never-worn | `Deprecation` | set `deprecated=true` + note when staleness rule trips (define thresholds below) |
| ownership history across resale | new dataset URN per ownership period + `UpstreamLineage` | `transfer-owner` creates a new URN, sets `UpstreamLineage.upstreams = [previous urn]` |
| condition score as verified assertion | DataHub Assertions (stretch, Tier 2+) | fallback: keep as customProperties only if time-constrained |

## Staleness thresholds (LOCKED — Day 1)
Values live in `api/app/config.py` (`Settings`); change them there and mirror here in the same commit.
- **Never-worn:** catalogued ≥ **30 days** ago with **0** check-ins → `Deprecation` note `"never worn"`, status `flagged-unworn`.
- **Overworn:** **≥ 4** check-ins within a rolling **7-day** window → `Deprecation` note `"overworn"`, status `flagged-overworn`.
- **Condition score:** starts at **100**, drops **1.5** per wear (clamped 0–100). Kept in `customProperties`; Assertions are Tier 2.

These numbers are demo-tuned: 4-in-7 trips on the "wore it every day this week" repeat-outfit story; 30-day never-worn matches a catalog-then-forget item.

## Seed script
One-time script (run before Day 1) to create the glossary node + terms so `GlossaryTerms` aspect writes don't fail on missing term URNs. Keep it in `/api/scripts/seed_glossary.py`.

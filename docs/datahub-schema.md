# DataHub schema

Status: **draft, lock on Day 0 (Aug 4).** Owned by Person A; update here whenever the aspect mapping changes.

## Shared instance
- Host/URL: **TBD — fill in once stood up on Day 0.**
- GMS: `:8080`, UI: `:9002` (defaults for `datahub docker quickstart`)
- Platform URN used for all garments: `urn:li:dataPlatform:slaydar`

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

## Staleness thresholds (fill in once agreed)
- Never-worn: not checked in within **N days** of catalog date → `Deprecation` note "never worn"
- Overworn: wear_count within **M days** exceeds **K** → `Deprecation` note "overworn"

(Pick N/M/K on Day 0 or Day 1 — needs a number for the demo to look intentional, not arbitrary.)

## Seed script
One-time script (run before Day 1) to create the glossary node + terms so `GlossaryTerms` aspect writes don't fail on missing term URNs. Keep it in `/api/scripts/seed_glossary.py`.

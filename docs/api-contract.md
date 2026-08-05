# API contract — `/web` (Person B) ↔ `/api` (Person A)

Status: **draft, lock on Day 0 (Aug 4).** Whoever changes an endpoint updates this file in the same PR.

## Garment object (shared shape)

```json
{
  "garment_id": "string",
  "owner_id": "string",
  "category": "string",
  "color": "string",
  "material": "string",
  "brand": "string | null",
  "style_tags": ["string"],
  "wear_count": "number",
  "last_worn_date": "ISO date | null",
  "cost_per_wear": "number | null",
  "condition_score": "number 0-100",
  "status": "active | flagged-overworn | flagged-unworn | listed-for-resale"
}
```

## Endpoints (`/api`, FastAPI)

| Method | Path | Body | Returns | Notes |
|---|---|---|---|---|
| POST | `/garments` | vision-extracted fields (category/color/material/brand/style_tags) + owner_id | garment object | creates Dataset entity + Ownership + GlossaryTerms |
| GET | `/closet/{owner_id}` | — | `[garment object]` | list for closet view |
| GET | `/garments/{id}` | — | garment object | |
| POST | `/garments/{id}/checkin` | `{ "worn_date": "ISO date" }` | updated garment object | increments wear_count, updates last_worn_date, recomputes cost_per_wear, sets `Deprecation` flag if overworn/unworn |
| POST | `/garments/{id}/transfer-owner` | `{ "new_owner_id": "string" }` | garment object (new garment_id) | creates new dataset URN for the new ownership period, links via `UpstreamLineage` to the previous one |
| GET | `/garments/{id}/lineage` | — | ownership-chain summary (list of past garment_ids/owners) | powers the demo's lineage moment |
| POST | `/garments/resolve-link` | `{ "url": "string" }` | garment object (unsaved, for confirm-before-create) | Tier 2 — schema.org Product parsing |

## Runtime Claude calls (live in `/web`, not `/api`)
- Vision extraction: photo(s) → structured fields matching the "vision-extracted fields" above, then `POST /garments`.
- Check-in match: photo → best-guess `garment_id` from `/closet/{owner_id}`, user confirms, then `POST /garments/{id}/checkin`.
- Roast generation: pull current garment stats (from `/closet/{owner_id}` or `/garments/{id}`) and pass into the Slaydar system prompt (locked in `PLAN.md` §5) — never let the model invent a stat not present in the fetched data.

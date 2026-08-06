# API contract — `/web` (Person B) ↔ `/api` (Person A)

Status: **draft, lock on Day 0 (Aug 4).** Whoever changes an endpoint updates this file in the same PR.

## Live API base URL (for Person B)
Person A's FastAPI service is exposed to Person B via a cloudflared tunnel (the app talks to `/api`, not to DataHub directly — only `/api` writes to DataHub):

```
https://novelty-friends-dash-opposite.trycloudflare.com
```

- Quick smoke: `GET /health` → `{"status":"ok",...,"datahub_dry_run":false}` means it's live against DataHub.
- ⚠️ **Ephemeral URL** — a `trycloudflare.com` quick tunnel gets a *new* random URL every time it restarts (reboot, laptop sleep, or Person A stopping it). If it stops resolving, Person A re-runs the tunnel and updates this line. Set it as an env var in `/web` (e.g. `SLAYDAR_API_BASE`) so swapping it is a one-line change.
- No auth on the API — fine for the hackathon, but don't post the URL publicly.

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
| POST | `/garments` | vision-extracted fields (category/color/material/brand/style_tags) + owner_id; optional `cost` (number, for cost_per_wear) and `cataloged_date` (ISO date, backdate to demo never-worn) | garment object | creates Dataset entity + Ownership + GlossaryTerms |
| GET | `/closet/{owner_id}` | — | `[garment object]` | list for closet view |
| GET | `/garments/{id}` | — | garment object | |
| POST | `/garments/{id}/checkin` | `{ "worn_date": "ISO date" }` | updated garment object | increments wear_count, updates last_worn_date, recomputes cost_per_wear, sets **overworn** `Deprecation` flag |
| POST | `/garments/evaluate-staleness` | `{ "owner_id"?: "string" }` (or empty `{}`) | `[garment object]` (evaluated set) | **staleness sweep** — flags **never-worn** items (`Deprecation` + status `flagged-unworn`). Omit body / owner_id to sweep everything; pass `owner_id` to scope to one closet. Idempotent, re-runnable. See "never-worn trigger" below. |
| POST | `/garments/{id}/transfer-owner` | `{ "new_owner_id": "string" }` | garment object (new garment_id) | creates new dataset URN for the new ownership period, links via `UpstreamLineage` to the previous one |
| GET | `/garments/{id}/lineage` | — | ownership-chain summary (list of past garment_ids/owners) | powers the demo's lineage moment |
| POST | `/garments/resolve-link` | `{ "url": "string" }` | garment object (unsaved, for confirm-before-create) | Tier 2 — schema.org Product parsing. **Currently a 501 stub in `/api`, not called by `/web`** — see note below. |

### Deprecation flags: overworn vs never-worn (for Person B)
Two staleness signals, set by two different triggers — both surface as `status` on the garment object:
- **`flagged-overworn`** — set automatically on **check-in** (≥4 wears in 7 days). Nothing extra to call; it just appears after enough check-ins.
- **`flagged-unworn`** — set by the **staleness sweep** (`POST /garments/evaluate-staleness`), because a never-worn item never checks in and so can't self-flag. Call it to refresh flags before rendering the closet, or wire a "run staleness check" demo button. To *demo* never-worn without waiting 30 real days, create the garment with a backdated `cataloged_date` (30+ days ago), then run the sweep.

## Runtime Claude calls (live in `/web`, not `/api`)
- Vision extraction: photo(s) → structured fields matching the "vision-extracted fields" above, then `POST /garments`.
- Check-in match: photo → best-guess `garment_id` from `/closet/{owner_id}`, user confirms, then `POST /garments/{id}/checkin`.
- **Link resolution: implemented entirely in `/web` (`POST /api/resolve-link`, Next.js route), not `/api`.** Since `POST /garments/resolve-link` on the backend was still a 501 stub, `/web` fetches the pasted URL server-side itself, extracts title/meta/JSON-LD via regex, and normalizes it through Gemini with the same schema used for vision extraction — returning `ExtractedGarment` fields, then reusing the existing `POST /garments` save flow. If `/api` later implements the real endpoint, `/web`'s route can be swapped to call it instead; until then, no need to build it on the backend too.
- Roast generation: pull current garment stats (from `/closet/{owner_id}` or `/garments/{id}`) and pass into the Slaydar system prompt (locked in `PLAN.md` §5) — never let the model invent a stat not present in the fetched data.

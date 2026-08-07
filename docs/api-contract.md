# API contract — `/web` (Person B) ↔ `/api` (Person A)

Status: **draft, lock on Day 0 (Aug 4).** Whoever changes an endpoint updates this file in the same PR.

## Live API base URL (for Person B)
Person A's FastAPI service is exposed to Person B via a **stable ngrok reserved domain** (the app talks to `/api`, not to DataHub directly — only `/api` writes to DataHub):

```
https://unsterile-dipper-degrading.ngrok-free.dev
```

- **Stable** — this URL does *not* change across restarts/reboots (ngrok reserved domain). Set it once as `API_BASE_URL` in `/web/.env.local`.
- Quick smoke: `GET /health` → `{"status":"ok",...,"datahub_dry_run":false}` means it's live against DataHub.
- If it stops resolving, Person A just needs the tunnel running again: `cd api && ./scripts/demo_up.sh` (same URL comes back).
- No auth on the API — fine for the hackathon, but don't post the URL publicly.

**⚠️ ngrok free-tier browser warning — send this header on API calls.** ngrok shows an HTML interstitial ("You are about to visit…") for requests with a *browser* User-Agent. Next.js **server-side** fetches (server components, route handlers) use a node UA and bypass it automatically — so normal SSR works. But any **client-side / in-browser** `fetch` to the API gets the HTML page instead of JSON and will fail to parse. Fix: add this header to API requests from `/web`:
```
ngrok-skip-browser-warning: true
```
(Opening the URL directly in a browser also shows the page — click "Visit Site" once, or add the header. Plain `curl` is unaffected: its UA isn't a browser.)

**⚠️ Sandboxed agent shells may block the tunnel (TLS handshake rejected).** If a `curl`/fetch to the ngrok URL fails with a *TLS handshake rejection* (not a timeout, not an ngrok error page), that's your **environment blocking tunnel services at the network layer** (SNI-based egress filtering — common in sandboxed Claude Code / CI shells; `ngrok.com` itself still loads because only the tunnel edges `*.ngrok-free.dev` are blocked). This is **not** a dead tunnel — verify by hitting `/health` from a *non-sandboxed* shell (your real Terminal.app) or your browser, where it returns 200. Practical workarounds:
- **Develop inside the sandbox against mock data** (`src/lib/mock-garments.ts`, already the fallback), and exercise the live API only from your real machine's browser/terminal.
- **The demo is unaffected** — it runs from a real browser on a real machine, which reaches the tunnel fine.
- If your *whole machine* (not just the agent) blocks tunnels, **co-locate for the demo** — both point at Person A's laptop, which already runs DataHub + the API.

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
| POST | `/garments/resolve-link` | `{ "url": "string" }` | — | **Intentionally 501 in `/api`.** Link resolution needs the LLM call, which by architecture lives only in `/web`. `/web` owns this end-to-end and reuses `POST /garments` to save — see note below. Not a stub to finish. |

### Deprecation flags: overworn vs never-worn (for Person B)
Two staleness signals, set by two different triggers — both surface as `status` on the garment object:
- **`flagged-overworn`** — set automatically on **check-in** (≥4 wears in 7 days). Nothing extra to call; it just appears after enough check-ins.
- **`flagged-unworn`** — set by the **staleness sweep** (`POST /garments/evaluate-staleness`), because a never-worn item never checks in and so can't self-flag. Call it to refresh flags before rendering the closet, or wire a "run staleness check" demo button. To *demo* never-worn without waiting 30 real days, create the garment with a backdated `cataloged_date` (30+ days ago), then run the sweep.

## Runtime Claude calls (live in `/web`, not `/api`)
- Vision extraction: photo(s) → structured fields matching the "vision-extracted fields" above, then `POST /garments`.
- Check-in match: photo → best-guess `garment_id` from `/closet/{owner_id}`, user confirms, then `POST /garments/{id}/checkin`.
- **Link resolution: implemented entirely in `/web` (`POST /api/resolve-link`, Next.js route), not `/api`.** Since `POST /garments/resolve-link` on the backend was still a 501 stub, `/web` fetches the pasted URL server-side itself, extracts title/meta/JSON-LD via regex, and normalizes it through Gemini with the same schema used for vision extraction — returning `ExtractedGarment` fields, then reusing the existing `POST /garments` save flow. If `/api` later implements the real endpoint, `/web`'s route can be swapped to call it instead; until then, no need to build it on the backend too.
- Roast generation: pull current garment stats (from `/closet/{owner_id}` or `/garments/{id}`) and pass into the Slaydar system prompt (locked in `PLAN.md` §5) — never let the model invent a stat not present in the fetched data.
- **Cross-user "someone else has this" match (Tier 2): implemented entirely in `/web` (`POST /api/cross-user-match`), not `/api`.** There's no real cross-owner search endpoint or user directory, so this checks a small hardcoded list of known demo owner_ids (`OTHER_DEMO_OWNER_IDS` in `web/src/lib/constants.ts` — currently `["alex", "sam"]`, matching Person A's `seed_demo.py` resale lineage chain) via the existing `GET /closet/{owner_id}`, and looks for a category+color+brand match. Triggered automatically after a photo extraction or link resolution saves successfully. If Person A's seed data's owner_ids ever change, update that constant to match.

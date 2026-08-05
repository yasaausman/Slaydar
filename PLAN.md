# Slaydar — Build Plan (DataHub: The Agent Hackathon)

**Deadline:** Mon Aug 10, 2026 · **Today:** Tue Aug 4, 2026 · **6 build days, 2 people, both on Claude Code**

This plan turns `slaydar-hackathon-summary.md` into an executable build: who owns what, in what order, and — the part the summary left open — exactly how a garment becomes a real DataHub entity, not just an analogy.

---

## 1. Roles (split by system, not by feature, to minimize merge conflicts)

**Person A — DataHub & Backend**
- Stand up DataHub, model garments as entities/aspects
- FastAPI service wrapping the DataHub Python SDK (`acryl-datahub`)
- Ownership transfer, usage-stat updates, staleness/deprecation logic, condition-score computation
- Link-paste product resolution (Tier 2, if time)

**Person B — Agents & Frontend**
- Next.js (TypeScript) frontend: upload, daily check-in, Slaydar chat, listing/resale screen
- Gemini-powered agents that run *inside the app* at runtime (separate from Claude Code, which you're both using to write the code — the app itself calls Google's Gemini API, chosen for its free tier): vision extraction agent, check-in match agent, roast-generation agent
- Slaydar voice/system prompt, demo video, pitch deck

**Shared, written on Day 0 before either of you writes app code:** the API contract between frontend and backend (`docs/api-contract.md`) and the DataHub schema (`docs/datahub-schema.md`, see §3). Once that's locked, you can build in parallel against mocks without blocking each other.

---

## 2. Architecture

```
Next.js app (Person B)                FastAPI service (Person A)
 - upload / check-in / chat UI  --->   - /garments (create)
 - calls Gemini API directly            - /garments/{id}/checkin
   for: vision extraction,             - /garments/{id}/transfer-owner
   check-in matching, roast text       - /garments/{id}/lineage
                                        - /closet/{owner_id}
                                              |
                                        acryl-datahub SDK
                                              |
                                        DataHub GMS (docker quickstart)
                                        localhost:9002 UI / :8080 GMS
```

Two services, one per person, talking over a small REST contract. The app's runtime Gemini calls (vision/roast) live in the Next.js server actions — no need for a third service.

**Logistics:** run one **shared** DataHub instance both of you point at (whoever has a spare machine, or a small cloud VM), not two local instances that drift apart. You want one consistent dataset for the demo, and it lets you *show the live DataHub UI* during the pitch.

---

## 3. DataHub schema — the technical bet that makes this "real DataHub," not a database with a theme

Custom entity types require modifying DataHub's own source — too slow for 6 days. Instead, model each garment as a DataHub **Dataset** entity (`urn:li:dataset:(urn:li:dataPlatform:slaydar,<garment_id>,PROD)`) and lean on DataHub's *built-in* aspects, each of which maps onto a real feature, not a workaround:

| Garment concept | DataHub aspect | Notes |
|---|---|---|
| Ownership, reassigned on resale | `Ownership` | swap owner URN on resale |
| Style tags | `GlossaryTerms` | seed a small glossary once (casual/formal/streetwear/...) |
| category/color/material/brand/wear_count/last_worn/cost_per_wear/condition_score | `DatasetProperties.customProperties` | simplest, fastest path — a string map, update via MCP on every check-in |
| Overworn / never-worn flag | `Deprecation` | DataHub's native staleness aspect — literally built for this, don't roll your own |
| Full history across owners | **new dataset URN per (item, ownership period)** + `UpstreamLineage` edges chaining them | lets you pull up the actual DataHub lineage **graph UI** live in the demo — this is your strongest "we didn't fake this" proof for judges |
| Condition score as a verified assertion (stretch) | DataHub **Assertions** | more wiring than it's worth for 6 days — only attempt if Tier 1 is done early; customProperties is the safe default |

Write every mutation as a `MetadataChangeProposal` via the Python SDK. Keep the emitter functions in one module (`datahub_client.py`) so Person A can unit-test them against a local DataHub without the frontend.

**Decision on ownership history:** use option (b) above — a new dataset URN per ownership period, linked by lineage — specifically *because* it's demoable in the DataHub UI. This resolves the "does DataHub actually do work here" test from the summary in the most visible way possible.

---

## 4. Data contract (lock this Day 0, before parallel work starts)

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
Frontend builds against this shape with mock data starting Day 0; backend makes it real by Day 2.

---

## 5. Slaydar voice — locked system prompt (resolves open question #3)

```
You are Slaydar: a wardrobe agent with a sarcastic, affectionate roast persona.

Rules (non-negotiable):
1. Every roast must cite a real number pulled from the garment's DataHub record
   (wear_count, last_worn_date, cost_per_wear, category counts). Never invent a stat.
2. Never comment on the user's body, weight, fit, or looks. Only comment on
   wear behavior and choices.
3. Format: one hard data point (stat badge) + one line of personality. The
   number earns the joke.

Examples:
✅ "Fourth time this week, bestie. This shirt is unionizing."
✅ "You own 14 black t-shirts and wore 3 of them. List the other 11."
❌ Anything about how an item fits or looks on the user's body.

Tone: confident, a little chaotic, Gen-Z texting energy, never mean about the
person — only about their closet's behavior.
```
Put this verbatim in the roast-agent's system prompt on Day 0 so Person B isn't iterating on tone later in the week.

---

## 6. Day-by-day

| Day | Date | Person A (DataHub/Backend) | Person B (Agents/Frontend) |
|---|---|---|---|
| 0 | Tue Aug 4 | Lock data contract + DataHub schema (§3/§4). `datahub docker quickstart` running, seed glossary terms. | Scaffold Next.js app + routes with mock data. Lock Slaydar system prompt (§5). |
| 1 | Wed Aug 5 | FastAPI skeleton; `datahub_client.py` emitter: create-entity, ownership, customProperties. | Upload UI; vision extraction agent (photo → structured JSON) against Gemini API. |
| 2 | Thu Aug 6 | `/garments` endpoint live; wire vision-agent output → real DataHub writes. | Wire upload flow to `/garments`; live tagging UI as items land. |
| 3 | Fri Aug 7 | Check-in endpoint: wear_count/last_worn update, `Deprecation` flag logic (overworn/unworn). | Check-in UI + confirm-the-match flow; roast agent reading real stats from backend. |
| 4 | Sat Aug 8 | Resale: new dataset URN + lineage edge on transfer-owner; condition-score formula. | Overworn/unworn banner → resale CTA; listing screen showing condition score. Stretch: link-paste (Person A) + cross-user match UI if ahead of schedule. |
| 5 | Sun Aug 9 | **Feature freeze by midday.** Integration bug bash together. Seed real demo photos into shared DataHub instance. | Same bug bash. Record demo video, build pitch deck, rehearse the 3-min script (§7 below, per summary §8). |
| 6 | Mon Aug 10 | Morning: fix-only buffer. Submit before deadline. | Final rehearsal, submit. |

Tier 2 items (link-paste, condition-score listing screen, cross-user match) only get attempted if Day 3 finishes on schedule — don't let them creep earlier and threaten the Tier 1 spine.

---

## 7. Demo script (unchanged from summary §8, restated for rehearsal)
1. Upload closet photos → extraction agent tags live.
2. Mock daily check-in → Slaydar roasts a repeat outfit, citing a real wear count.
3. Overworn/unworn flag triggers a resale suggestion.
4. Paste a product link → resolves to canonical item, matches a secondhand listing.
5. Close on the listing screen's condition score — then **pull up the live DataHub lineage graph UI** showing the item's ownership chain. This is the moment that proves the DataHub integration is real.

---

## 8. Working together in Claude Code

- Monorepo: `/web` (Next.js, Person B) and `/api` (FastAPI, Person A), each with its own `CLAUDE.md` scoped to that service, plus a root `CLAUDE.md` linking to `docs/api-contract.md` and `docs/datahub-schema.md` — see root `CLAUDE.md` in this repo.
- **We work directly on `main`, no feature branches or PRs** (locked in root `CLAUDE.md`'s "Sync workflow" section) — the least ceremony for a 2-person hackathon. The loop: `git add -A && git commit -m "..." && git pull --rebase && git push`, run after every commit-sized chunk of work, not batched into one end-of-day push.
- If either of you changes the API contract or DataHub schema mid-week, update `docs/api-contract.md` / `docs/datahub-schema.md` in the **same commit** — that's what keeps both Claude Code sessions honest about the interface without a live meeting.
- Person A owns `/api`; Person B owns `/web`. Crossing that line is fine, just say so in the commit message.

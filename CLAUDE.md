# Slaydar

Wear-history-backed wardrobe agent for "Build with DataHub: The Agent Hackathon" (deadline Aug 10, 2026). Full plan: [PLAN.md](PLAN.md).

## What this is
Catalogs a closet from photos, tracks real wear history, and turns that history into a verified trust signal on resale — by modeling garments as DataHub entities (ownership, usage stats, deprecation/staleness, lineage), not just rows in a database. See [PLAN.md](PLAN.md) §3 for the exact DataHub aspect mapping.

## Repo layout
- `/web` — Next.js (TypeScript) frontend + runtime Gemini agent calls (vision extraction, check-in matching, roast generation) — Gemini instead of a paid API specifically for its free tier. Owned by Person B. See `web/CLAUDE.md`.
- `/api` — FastAPI service wrapping the DataHub Python SDK (`acryl-datahub`). Owned by Person A. See `api/CLAUDE.md`.
- `docs/api-contract.md` — the REST contract between `/web` and `/api`. Update this in the same PR as any endpoint change — it's the source of truth both people's Claude Code sessions should defer to.
- `docs/datahub-schema.md` — the DataHub entity/aspect schema (Dataset URNs, which aspects carry which fields).

## Non-negotiables
- Slaydar's roast must always cite a real stat from DataHub; never invent a number; never comment on the user's body/fit/looks. Full locked system prompt in [PLAN.md](PLAN.md) §5 — use it verbatim.
- Garments are DataHub `Dataset` entities, not a custom entity type (no time to modify DataHub source this week).
- Ownership history across resale = a new dataset URN per ownership period, linked by `UpstreamLineage` — chosen specifically so the DataHub lineage graph UI is demoable live.

## Shared DataHub instance
Both of you point at one shared DataHub instance (not separate local ones) so demo data stays consistent. Currently running on Person A's machine (`datahub docker quickstart`, v1.7.0) — full access details in `docs/datahub-schema.md`. `/api` is exposed to Person B via a **stable ngrok reserved domain** (URL in `docs/api-contract.md`) since only `/api` talks to DataHub directly; the URL is fixed across restarts, so no repush is needed when Person A's laptop reboots.

## Sync workflow (both people, every step)
We work **directly on `main`** — no feature branches, no PRs. This keeps a 2-person hackathon in sync with the least ceremony. After completing each meaningful step (a working commit-sized chunk), run this loop so neither person drifts:

```bash
git add -A
git commit -m "<what changed>"
git pull --rebase
git push
```

Rules:
- **Pull before you start** each work session (`git pull --rebase`) so you're building on the other person's latest.
- Commit **small and often** — one logical step per commit. Don't batch a whole day into one push.
- If a rebase conflict hits, resolve it in the two files most likely to collide: `docs/api-contract.md` and `docs/datahub-schema.md`. Whoever changes the contract updates the doc in the **same commit**.
- Never leave `main` in a broken state overnight — the other person pulls it first thing.
- Person A owns `/api` + `docs/datahub-schema.md`; Person B owns `/web`. Editing across that line is fine, but call it out in the commit message.
- **No `Co-Authored-By: Claude` trailer on commits.** Just the human author.

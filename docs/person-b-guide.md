# Person B step-by-step guide — Frontend & Agents

For the person building `/web` (Next.js) plus the runtime Claude calls (vision extraction, check-in matching, roast generation). Written for a beginner — every step spells out the exact commands.

**The rhythm, every single step** (this matches the "Sync workflow" locked in the root [CLAUDE.md](../CLAUDE.md) — we work directly on `main`, no branches, no PRs):
1. `git pull --rebase` — get anything Person A (or past-you) pushed, **before** you start.
2. Do the work for that step.
3. `git add -A && git commit -m "..." && git pull --rebase && git push` — save and share it.

Commit small: one logical step per commit, not a whole day batched into one push. If a rebase conflict hits, it's almost always in `docs/api-contract.md` or `docs/datahub-schema.md` — resolve it there and re-run the loop.

---

## Step 0 — One-time setup (do this once, today)

**Check you have Node.js (v18+):**
```bash
node -v
```
If that errors or shows something below v18, install it:
```bash
brew install node
```

**Get an Anthropic API key** (this is for *your app* to call Claude at runtime — separate from Claude Code, which you're using to write the code). Go to console.anthropic.com, create a key, and keep it somewhere safe. You'll paste it into a `.env.local` file in Step 1 — never into a file that gets committed to git.

**Quick git vocabulary**, since you'll do this a lot:
- `pull` = download the latest code others pushed
- `commit` = save a checkpoint of your changes, locally
- `push` = upload your commits to GitHub so Person A (and you, on another machine) can see them

---

## Step 1 (Day 0) — Scaffold the Next.js app

```bash
git pull --rebase
```

```bash
npx create-next-app@latest web --typescript --eslint --app --src-dir --import-alias "@/*"
```
Answer the prompts with defaults (Tailwind: yes, if asked — it'll make styling faster this week).

```bash
cd web
npm run dev
```
Open `http://localhost:3000` in a browser — you should see the default Next.js page. Stop the server with `Ctrl+C` once confirmed.

Create `web/.env.local` (this file is git-ignored by default — double check by running `cat .gitignore | grep env` inside `/web` before you paste in a real key):
```
ANTHROPIC_API_KEY=sk-your-key-here
```

Back in the repo root:
```bash
cd ..
git add -A
git commit -m "Scaffold Next.js frontend for Slaydar"
git pull --rebase
git push
```

---

## Step 2 (Day 0) — Mock data + empty page shells

```bash
git pull --rebase
```

Create `web/src/lib/mock-garments.ts` with 4–5 fake garment objects matching the shape in [docs/api-contract.md](api-contract.md) (category, color, wear_count, etc.) — this lets you build every screen before the backend exists.

Create empty route folders so the app has real pages to navigate between:
- `web/src/app/upload/page.tsx`
- `web/src/app/checkin/page.tsx`
- `web/src/app/closet/page.tsx`
- `web/src/app/listing/page.tsx`

Each can just render a heading for now (e.g. `<h1>Upload</h1>`).

```bash
git add -A
git commit -m "Add mock garment data and page shells"
git pull --rebase
git push
```

---

## Step 3 (Day 1) — Upload page UI

```bash
git pull --rebase
```

Build out `web/src/app/upload/page.tsx`: a file input (accept images), thumbnail previews of selected photos, and an "Extract" button. No API calls yet — just the UI and local state.

```bash
git add -A
git commit -m "Build upload page UI"
git pull --rebase
git push
```

---

## Step 4 (Day 1) — Vision extraction agent

```bash
git pull --rebase
```

```bash
cd web
npm install @anthropic-ai/sdk
cd ..
```

Create `web/src/app/api/extract/route.ts` — a Next.js API route that takes an uploaded image, sends it to Claude with a system prompt asking for the garment fields as JSON (category, color, material, brand, style_tags), and returns that JSON.

Wire the "Extract" button on the upload page to call `/api/extract` and show the raw JSON result on screen (just `<pre>{JSON.stringify(result)}</pre>` for now — polish comes later).

```bash
git add -A
git commit -m "Add vision extraction agent and wire to upload page"
git pull --rebase
git push
```

---

## Step 5 (Day 2) — Wire extraction to the real backend

```bash
git pull --rebase
```

Check with Person A (or `docs/api-contract.md`) whether `POST /garments` is live yet. Add `web/.env.local`:
```
API_BASE_URL=http://localhost:8000
```
(or wherever Person A's FastAPI service runs)

Update the upload flow: after extraction, `POST` the result to `${API_BASE_URL}/garments`. Note that per `api/CLAUDE.md`, the backend runs in **dry-run mode** if DataHub itself isn't reachable yet — so `/garments` can respond even before DataHub is fully wired up. If the FastAPI service isn't running at all yet, keep using the mock data from Step 2 and leave a `// TODO: swap for real API_BASE_URL call once /api is live` comment — don't block on Person A.

Build a simple closet grid page (`/closet`) that lists garments (from the real API once available, mock data until then) as cards.

```bash
git add -A
git commit -m "Wire extraction flow to backend /garments endpoint"
git pull --rebase
git push
```

---

## Step 6 (Day 3) — Check-in flow + Slaydar roast

```bash
git pull --rebase
```

Build `web/src/app/api/match/route.ts`: takes a check-in photo + the current closet list, asks Claude to propose the most likely `garment_id` match. Build the check-in page UI: upload a photo, show the proposed match, let the user confirm or pick a different item.

On confirm, call `POST /garments/{id}/checkin` on the backend.

Build `web/src/app/api/roast/route.ts` using the **locked system prompt from [PLAN.md §5](../PLAN.md#5-slaydar-voice--locked-system-prompt-resolves-open-question-3)** — paste it in verbatim. Pass in the real stats fetched for the confirmed garment; never let the model invent a number. Display the roast with its stat badge on the check-in confirmation screen.

```bash
git add -A
git commit -m "Add check-in matching flow and Slaydar roast generation"
git pull --rebase
git push
```

---

## Step 7 (Day 4) — Overworn/unworn banner + listing screen

```bash
git pull --rebase
```

On the closet page, show a banner/badge when a garment's `status` is `flagged-overworn` or `flagged-unworn`, with a "List for resale" button.

Build the `/listing` page: shows the garment's `condition_score` prominently, framed as "verified from tracked wear history."

If you're ahead of schedule, stretch goals: a link-paste form (paste a product URL, show the resolved item) and a "someone else has this" cross-user match display — coordinate with Person A since these need backend support (`/garments/resolve-link`).

```bash
git add -A
git commit -m "Add overworn/unworn banner and resale listing screen"
git pull --rebase
git push
```

---

## Step 8 (Day 5) — Bug bash, demo video, pitch deck

```bash
git pull --rebase
```

Sit down with Person A and walk the full flow end to end: upload → check-in → roast → overworn flag → listing. Fix whatever breaks. This is a **feature freeze day** — no new features, only fixes.

Record the demo video and build the pitch deck (these live outside the repo — Google Slides/Drive is fine). Rehearse the script in [PLAN.md §7](../PLAN.md#7-demo-script-unchanged-from-summary-8-restated-for-rehearsal).

```bash
git add -A
git commit -m "Bug fixes from integration testing"
git pull --rebase
git push
```
(Only if you actually changed code — an empty bug bash with no fixes needs no commit.)

---

## Step 9 (Day 6, deadline day) — Final check and submit

```bash
git pull --rebase
```
Confirm nothing was missed, do one last rehearsal, then submit on Devpost before the deadline.

---

## If something goes wrong

- **Conflict during `git pull --rebase`:** stop, don't force anything — paste the conflict here and we'll sort it out together.
- **Accidentally about to commit your `.env.local` or API key:** run `git status` before `git add` and make sure `.env.local` isn't listed. If it is, stop and ask — don't push it.
- **Unsure if `/api` is ready for a step:** check `docs/api-contract.md` first, then ask Person A directly rather than guessing at the response shape.

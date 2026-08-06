# Person B step-by-step guide — Frontend & Agents

For the person building `/web` (Next.js) plus the runtime Gemini calls (vision extraction, check-in matching, roast generation) — Gemini instead of a paid API specifically to keep this free. Written for a beginner — every step spells out the exact commands.

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

**Get a free Gemini API key** (this is for *your app* to call an AI model at runtime — separate from Claude Code, which you're using to write the code). We're using Google's Gemini API instead of a paid one specifically because it has a genuinely free tier. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey), sign in with a Google account, and it'll generate a key for you automatically — no credit card needed. Keep the key somewhere safe. You'll paste it into a `.env.local` file in Step 1 — never into a file that gets committed to git.

Free tier notes: rate limits are generous enough for a week of dev + a live demo, but they vary — check your actual limits under "Rate Limits" at [aistudio.google.com](https://aistudio.google.com) once you have a key. If you ever hit a limit mid-testing, just wait a minute and retry; it resets fast.

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
GEMINI_API_KEY=your-key-here
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
npm install @google/genai
cd ..
```

Create `web/src/app/api/extract/route.ts` — a Next.js API route that takes an uploaded image and asks Gemini to return the garment fields as JSON (category, color, material, brand, style_tags). Rough shape (check the current SDK docs for exact method names when you build this, since the JS SDK evolves):

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// upload the image, then something like:
const result = await ai.interactions.create({
  model: "gemini-3.6-flash", // free-tier, vision-capable
  input: [
    { type: "text", text: "Extract category, color, material, brand, and style_tags for this garment as JSON. Return only JSON." },
    { type: "image", uri: uploadedFile.uri, mime_type: uploadedFile.mimeType },
  ],
});
```

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

✅ **The backend is already live and reachable from your machine** — Person A stood up DataHub v1.7.0 and exposed the FastAPI `/api` through a cloudflared tunnel. You don't need Person A's machine or a local backend; just point at the tunnel URL. Add it to `web/.env.local`:
```
API_BASE_URL=https://novelty-friends-dash-opposite.trycloudflare.com
```
Sanity-check it works from your machine before wiring anything:
```bash
curl https://novelty-friends-dash-opposite.trycloudflare.com/health
```
You should get `{"status":"ok",...,"datahub_dry_run":false}` — `datahub_dry_run:false` means your calls write to the **real** DataHub, so anything you create shows up in the demo's DataHub UI.

⚠️ **This URL is ephemeral** — it changes whenever Person A's tunnel restarts (their laptop sleeping/rebooting, etc.). The current one always lives at the top of [docs/api-contract.md](api-contract.md); if `curl /health` stops resolving, `git pull --rebase` for the latest URL or ping Person A to restart the tunnel. Because it's in one env var, swapping it is a one-line change.

Update the upload flow: after extraction, `POST` the result to `${API_BASE_URL}/garments`. (If the tunnel is ever down mid-work, fall back to the Step 2 mock data and leave a `// TODO: swap for real API_BASE_URL call` comment — don't block on Person A. The backend also has a **dry-run mode** noted in `api/CLAUDE.md`, but right now it's fully live, not dry-run.)

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

Build `web/src/app/api/match/route.ts`: takes a check-in photo + the current closet list, asks Gemini to propose the most likely `garment_id` match (same `ai.interactions.create` pattern as Step 4, just with the closet list as extra text context alongside the image). Build the check-in page UI: upload a photo, show the proposed match, let the user confirm or pick a different item.

On confirm, call `POST /garments/{id}/checkin` on the backend.

Build `web/src/app/api/roast/route.ts` using the **locked system prompt from [PLAN.md §5](../PLAN.md#5-slaydar-voice--locked-system-prompt-resolves-open-question-3)** — paste it in as the instructions/system text for the Gemini call, same as before. Pass in the real stats fetched for the confirmed garment; never let the model invent a number. Display the roast with its stat badge on the check-in confirmation screen.

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

## Keeping this free

- Gemini's free tier is the only external cost surface in this whole project — DataHub, FastAPI, and Next.js all run locally at $0.
- Don't call the real Gemini API on every UI tweak. Use the mock data from Step 2 while you're styling things, and only hit the real API when you're actually testing extraction/matching/roast logic.
- No hosting needed either — run everything locally (`npm run dev`, `uvicorn`, `docker`) and demo straight from your laptop. If you want a public link later, revisit then; don't add hosting cost this week for no reason.

## If something goes wrong

- **Conflict during `git pull --rebase`:** stop, don't force anything — paste the conflict here and we'll sort it out together.
- **Accidentally about to commit your `.env.local` or API key:** run `git status` before `git add` and make sure `.env.local` isn't listed. If it is, stop and ask — don't push it.
- **Unsure if `/api` is ready for a step:** check `docs/api-contract.md` first, then ask Person A directly rather than guessing at the response shape.

@AGENTS.md

# /web — Slaydar frontend (Person B)

Next.js (TypeScript, App Router) frontend, plus the runtime Gemini calls the app makes on its own behalf (vision extraction, check-in matching, roast generation) — separate from Claude Code, which is the dev tool used to write this code.

## Golden rules
- **The contract is law.** Backend endpoint shapes come from [`../docs/api-contract.md`](../docs/api-contract.md) — don't invent a response shape, check there first.
- **Runtime AI calls use Gemini** (`@google/genai`, `GEMINI_API_KEY` in `.env.local`), chosen specifically for its free tier. Never Anthropic/OpenAI here.
- **The Slaydar roast must always cite a real stat** fetched from the backend. Use the locked system prompt in [`../PLAN.md` §5](../PLAN.md#5-slaydar-voice--locked-system-prompt-resolves-open-question-3) verbatim — never let the model invent a number, never comment on the user's body/fit/looks.
- Build against mock data (`src/lib/mock-garments.ts`) while styling UI; only call the real Gemini API when testing actual agent logic — keeps free-tier usage low.

## Layout (as it fills in)
- `src/app/upload/` — closet photo upload + vision extraction
- `src/app/checkin/` — daily check-in + match confirmation + roast
- `src/app/closet/` — garment grid, overworn/unworn banners
- `src/app/listing/` — resale listing screen with condition score
- `src/app/api/extract/`, `src/app/api/match/`, `src/app/api/roast/` — Gemini-calling API routes
- `src/lib/mock-garments.ts` — mock data matching the garment contract

## Running
```bash
cd web
npm run dev
```
Needs `GEMINI_API_KEY` and `API_BASE_URL` (Person A's FastAPI service, default `http://localhost:8000`) in `.env.local`.

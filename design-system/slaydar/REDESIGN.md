# Slaydar — Bold Redesign Brief

> Execution plan for the "bolder redesign" direction. Read `MASTER.md` first (source of
> truth for tokens/palette/type). This file maps that spec onto Slaydar's real screens and
> marks where **21st.dev Magic** components should be generated.
>
> **Status:** brief prepared 2026-08-08, pending 21st MCP being connected. Chosen direction:
> *editorial-brutalist layout + typography fused with the existing dark-neon OLED identity.*

## Direction in one line
Keep the obsidian + lime/fuchsia/purple neon identity. Make it **louder and more editorial**:
oversized Anton display type, an asymmetric **bento** hero + closet grid, big-number stats,
hard section dividers, GSAP stagger-in — instead of the current centered, uniform layout.

## Global (do first)
1. **Fonts:** add Anton (display/headlines + wordmark) alongside Geist (body). Wire via
   `next/font/google` in `layout.tsx`; expose `--font-display`. Body can stay Geist or move
   to Epilogue.
2. **Icons:** add `lucide-react`. Replace every emoji-as-icon with a Lucide icon
   (nav, feature cards, closet KPIs, badges). Keep emoji ONLY inside roast *content* (it's
   expressive copy there, not UI chrome). This clears anti-pattern #1.
3. **Motion:** respect `prefers-reduced-motion` globally (wrap keyframe utils in
   `@media (prefers-reduced-motion: no-preference)`). Add GSAP stagger for grids
   (see MASTER.md Motion) — or CSS stagger if avoiding a GSAP dep.
4. **Tokens:** promote repeated raw hex (`#0d0714`, `#d9ff3b`) to the CSS vars already in
   `globals.css`; add `--radius`, `--space-*` scale.

## Page-by-page

### `/` Home — `web/src/app/page.tsx`
- Rebuild hero as an **asymmetric bento**: giant Anton headline block (left, spanning 2 rows)
  + live roast card (right) + feature tiles below in uneven grid, not 4 equal columns.
- Replace 👑 badge with a real logomark (21st logo search or a Lucide `crown`/custom SVG).
- Feature cards: Lucide icons (`Camera`, `Flame`, `BarChart3`, `BadgeDollarSign`).
- 🔶 **21st:** `magic_component_inspiration` → "bento hero section dark neon"; then
  `magic_component_builder` for the hero bento + an animated feature grid.

### `/closet` — `web/src/app/closet/page.tsx` + `PinterestClosetGrid.tsx`
- KPI bar → bold **stat tiles** with big Anton numbers + Lucide icons
  (`Layers`, `Flame`, `Moon`, `Tag`) replacing 📌🔥💤🏷️.
- Masonry stays, but add hard category headers + stagger-in on load.
- 🔶 **21st:** `magic_component_builder` for a polished stat-tile row and a filter/sort bar.

### `/listing/[id]` — resale listing + `ConditionRing.tsx` + `ListingActions.tsx`
- Make the **Condition Score the hero** — oversized ring + big number, DataHub lineage as a
  visible "provenance" block (this is the product's whole thesis — sell it visually).
- 🔶 **21st:** builder for a "trust score / provenance" hero card.

### `/checkin` — daily check-in + roast — `web/src/app/checkin/page.tsx` + `SlaydarAgentCard.tsx`
- Keep the roast card (it's good) but scale up type and make the stat pill louder.
- 🔶 **21st:** `magic_component_refiner` on `SlaydarAgentCard.tsx` to elevate it.

### `/upload` — `web/src/app/upload/page.tsx` + `LinkResolveForm.tsx`
- Bold dropzone, clear form labels (not placeholder-only), inline validation, progress state.
- 🔶 **21st:** builder for a drag-and-drop upload zone with preview thumbnails.

## Constraints (non-negotiables — see repo CLAUDE.md / PLAN.md)
- Roast must cite a real DataHub stat; never invent numbers; never comment on body/fit.
- Build against `src/lib/mock-garments.ts` while styling; don't burn Gemini free-tier.
- Runtime AI = Gemini only in `/web`. Contract shapes come from `docs/api-contract.md`.

## How to run 21st once connected
Confirm with `/mcp` (should show `21st`). Tools:
`21st_magic_component_inspiration` (browse) → `21st_magic_component_builder` (generate) →
`21st_magic_component_refiner` (improve existing) → `logo_search` (brand marks).

## Pre-delivery
Run the MASTER.md checklist. Verify at 375/768/1024/1440px, light+dark focus rings,
reduced-motion, and no emoji-as-icon remaining.

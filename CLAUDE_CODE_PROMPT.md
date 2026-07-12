# Claude Code build prompt — footy-mp

Paste everything below into Claude Code, run from the repo root (`footy-mp/`).

---

You are building out **footy-mp**, a year-round football tracker + xG prediction engine.
The foundation already exists — read `ARCHITECTURE.md` first; it is the source of truth for
stack, schema, data sources, and the model plan. Do not re-architect it.

## What already exists (use it, don't rebuild)
- `ARCHITECTURE.md` — full design + milestones.
- `data/db/schema.sql` — Supabase Postgres schema. **Already applied to the live Supabase project.**
- `data/ingest/espn.py` — working ESPN client (fixtures/results/live/shootouts). Verified.
- `data/ingest/stats.py` — FBref/Understat xG client via `soccerdata`.
- `data/model/engine.py` — xG Dixon-Coles model: `fit_ratings`, `predict`, `knockout`, `backtest`.
  Verified end-to-end. `KO_TEMPER`/`PEN_FACTOR` still hold WC26 priors — re-fit them (Phase 2).
- `data/requirements.txt`, `.github/workflows/ingest.yml`.

## Environment
- Supabase project is live and `schema.sql` is applied. Use env vars `SUPABASE_URL` and
  `SUPABASE_SERVICE_KEY` (server-side) and `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client).
- Free data only. No paid APIs. Retrieve web data only via `soccerdata` or standard HTTP to the
  ESPN public API — never scrape around blocks.

## Design system (source of truth for all UI) — "Quant Desk"
A complete Claude Design handoff lives in **`design/`** (read `design/README.md` first). It is the
authoritative visual system — a dark warm-charcoal *terminal* aesthetic called **Quant Desk**, NOT a
light theme. Build the UI to match it exactly; do not invent styling.

- **Global CSS entry:** `design/project/styles.css` (imports `tokens/fonts.css`, `colors.css`,
  `typography.css`, `spacing.css`). Wire this into the Next.js root layout (or port the tokens into
  the Tailwind config / a global stylesheet). Use the CSS variables — never hardcode hex.
- **Look:** warm charcoal surfaces (`--bg-app` #131110, `--surface-panel` #1a1715), ember-orange
  primary (`--accent` #ff9d2e), steel-cyan secondary (`--accent-2` #4fc1dd), **tape-gold for the
  follow layer** (`--follow` #ffce53 — gold ★ = followed, never green). One typeface everywhere:
  **Spline Sans Mono** (the terminal identity; hierarchy via weight/case/color). Tabular figures for data.
- **Semantic tokens carry meaning — use them:** `--status-through/runner/playoff/out`,
  `--zone-ucl/uel/conf/releg` (league-table zones), `--status-win/draw/loss/live`, `--follow`.
- **Components are pre-built React** in `design/project/components/{core,football,data}/`. Each ships
  as `.jsx` (implementation), `.d.ts` (TypeScript props), and `.prompt.md` (usage examples + rules).
  **Adopt them directly into `web/`** (target is React) — copy in, wire to real data, keep the API in
  the `.d.ts`. Inventory:
  - core: `Button`, `IconButton`, `Tag`, `SectionHeading`, `FollowButton`
  - football: `MatchRow`, `FixtureGroup`, `LeagueTable`, `GroupStandings`, `PlayerCard`,
    `PlayerStatRow`, `CompetitionBadge`
  - data (model outputs): `StatCard`, `ProbabilityBar`, `ScorelineGrid`, `RatingRing`, `FactorBar`,
    `FormPills`, `BarMeter`
- **Assembled reference:** `design/project/ui_kits/visualizer/` (`app.jsx`, `match.jsx`, `bracket.jsx`,
  `model.js`, `data.js`, `kit.jsx`) shows how the components compose into full views — use it as the
  layout blueprint. Style guide + screenshots: `design/project/guidelines/*.card.html` and
  `design/project/reference/` (`team-detail.png`, `bracket.png`). Read the source directly; don't
  render/screenshot unless asked.
- The football `data/` components map 1:1 to our model outputs — wire `ProbabilityBar` to
  `predictions.p_home/draw/away`, `ScorelineGrid` to the DC matrix, `RatingRing` to `model_ratings`,
  `FactorBar` to the strength factors, `FollowButton` to the `follows` table.

## Seed follow list (make it editable in the DB via the `follows` table)
Players: Luis Díaz, James Rodríguez, Juan Fernando Quintero, Richard Ríos, Jhon Lucumí.
Teams: Colombia (NT), Bayern Munich, plus each seeded player's club.
Leagues: Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League.
Countries: Colombia. (Confirm/extend with the user if they add names.)

---

## Phase 1 — Data pipeline (M1)
1. Build `data/pipeline.py` (the orchestrator referenced by the GitHub Action): 
   ESPN fixtures/results → Understat xG → upsert into Supabase (`matches`, `team_match_stats`,
   `player_match_stats`, `teams`, `players`, `leagues`, `countries`). Idempotent upserts keyed on
   `espn_event_id` and natural keys. Add a `data/db.py` Supabase helper.
2. Entity resolution: ESPN and Understat/FBref use different team/player name spellings. Build a
   normalization/alias map so the same team joins across sources. Store `espn_id`/`fbref_id`.
3. Backfill: last 3–4 completed seasons of Understat xG for the big-5 leagues + current season.
   Then wire incremental daily pulls.
4. Seed the `follows` table with the list above.

## Phase 2 — Model v1 + prove it (M2) — do this BEFORE the UI
1. `data/model/pipeline.py`: read `team_match_stats` from Supabase, call `engine.fit_ratings`,
   write `model_ratings`; generate `predictions` for upcoming fixtures; write to Supabase.
2. Re-fit `KO_TEMPER` and `PEN_FACTOR` from the real dataset (shootout + knockout records),
   replacing the WC26 priors, using the same shrinkage approach documented in the code comments.
3. **Backtest gate (required):** run `engine.backtest` walk-forward on the backfilled data and
   compare against a FIFA/goal-proxy baseline that mimics WC26. Print and store (`backtest_runs`)
   RPS, log-loss, Brier for both. **The xG model must beat the baseline on RPS and log-loss.**
   If it doesn't, tune (recency half-life, DC rho, shrinkage) until it does, and report the numbers.
   Do not proceed to Phase 3 until this passes.

## Phase 3 — Next.js app (M3): build the MOBILE 4-tab redesign
Create `web/` — Next.js 14 App Router, TypeScript, deploy target Vercel.

**The pixel-level target is the mobile handoff in `design/handoff-mobile/`. Read
`design/handoff-mobile/README.md` top to bottom first — it is a high-fidelity spec** with exact
layout, spacing, colors, radii, and interactions for every screen. The prototype JSX
(`design/handoff-mobile/footy-mp/screens-main.jsx`, `screens-detail.jsx`, `ui.jsx`, `app.jsx`,
`ios-frame.jsx`) is the reference implementation; recreate it in Next.js — do not copy the Babel
prototype verbatim. Its mock `data.js` mirrors the real Supabase schema, so mapping is ~1:1.

**What the current live build (mpfc-ashen.vercel.app) got WRONG — do not repeat:** it's a desktop
single-scroll page of flat text link-lists (a 20-row "recent results" wall, bare lists for
leagues/teams/players), it uses none of the Quant Desk components, and the model is invisible.
Replace it entirely with the mobile app below.

1. `lib/supabase.ts` (server + client) and `lib/data.ts` mapping Supabase rows to the shapes the
   screens consume (matches, predictions, model_ratings, follows) — mirror `handoff-mobile/.../data.js`.
2. **Mobile-first, 4-tab shell** with an always-visible bottom tab bar (~48px targets, 18px safe-area
   pad), detail screens pushed on a stack over the active tab (sticky back-chevron header), nav +
   follow state persisted (URL routes + Supabase `follows`):
   - **Today** (default) — next-match hero (gold rail), live hero (red rail, pulsing dot), "next up",
     news, WC knockouts, "just in" results, "your players at the cup" (PlayerStatRow). Model is
     first-class: ProbabilityBar in every hero.
   - **Matches** — UPCOMING/RESULTS segmented control + competition chip rail + day-grouped FixtureGroup.
   - **Tables** — league chip rail + LeagueTable with zone rails (UCL ember / UEL steel / conf amber /
     releg red), followed teams gold ★, colored form column, zone legend.
   - **Following** — 3 StatCards (players/teams/leagues) + sectioned watchlist with icon-only FollowButtons.
3. **Detail screens** (pushed): Match (scoreboard + pre-match forecast ProbabilityBar + StatCards +
   Verdict callout + ScorelineGrid 5×5 Poisson from pred xG + FormPills + FactorBars), Team (RatingRing
   + attack/defense StatCards + form + MATCHES/SQUAD/MODEL segmented), Player, League. Every screen
   surfaces the xG model as content, per the README.
4. **Port the Quant Desk DS components** from `design/project/components/{core,football,data}/` into
   `web/components/` (MatchRow, FixtureGroup, ProbabilityBar, LeagueTable, StatCard, RatingRing,
   FactorBar, FormPills, ScorelineGrid, PlayerCard, PlayerStatRow, FollowButton, SectionHeading,
   CompetitionBadge, Tag). Wire `design/project/styles.css` tokens into the app; use CSS variables /
   semantic tokens (`--follow` gold, `--status-*`, `--zone-*`), never hardcode colors. Spline Sans Mono.
5. A live-match view that reuses the WC "lowdown" analytical voice for followed games in progress.

## Phase 4 — Responsive + refinement (the mobile build overcorrected)
The current deploy is **mobile-only**: on desktop it strands a narrow phone-width column in dead
space, and the server-rendered / no-JS output still shows the OLD flat desktop link-lists (so SSR
never got the new layout). Fix both. Keep the mobile design; make it adapt up.

1. **One responsive app, two IA modes, shared Quant Desk components:**
   - **Mobile (< 768px):** the `design/handoff-mobile/` 4-tab shell exactly as specced — bottom tab
     bar, single column, pushed detail screens.
   - **Desktop (≥ 1024px):** switch the shell — replace the bottom tab bar with a **persistent left
     sidebar** (the 4 nav items + watchlist summary), a centered content column at a sensible
     `max-width` (~1100px, not full-bleed, not a 390px phone frame), and a **master–detail split**:
     list/feed on the left, the Match/Team/Player/League detail rendered in a **right-hand pane**
     instead of a full-screen push. This mirrors the original visualizer kit
     (`design/project/ui_kits/visualizer/app.jsx` — rail + `detailPane`). Same components, wider frame.
   - **Tablet (768–1024px):** single wider column, 2-up content grids where they help; either nav pattern.
   - Use CSS/Tailwind breakpoints or a `useMediaQuery` — do NOT ship a fixed phone frame centered on desktop.
2. **Fix SSR:** server-render the real current layout so first paint and the no-JS view match the app
   (not the old flat lists). Detail routes must render server-side too.
3. **Data / empty-state polish:** it's off-season, so "next up" is empty. Make empty states useful —
   pull upcoming from followed *leagues* (not only followed teams), and lead with the model
   (predictions, ratings, last-5 form) so the page is never a dead "nothing to show."
4. **General refinement pass:** consistent spacing/rhythm from the token scale, correct touch vs.
   pointer targets per breakpoint, no horizontal scroll on desktop, real loading/skeleton states,
   and verify the DS components render with the actual data shapes (no clipped bars, no overflow).

## Constraints & definition of done
- Every model change is validated by the backtest; never ship a model that loses to the baseline.
- Idempotent, re-runnable ingest; the GitHub Action runs green.
- `npm run build` passes; the app is **responsive**: mobile = the `design/handoff-mobile/` 4-tab
  shell; desktop = sidebar + master–detail at a sensible max-width (no phone frame stranded in dead
  space). SSR renders the real layout, not the old flat lists. Real follows, fixtures, and model
  predictions render at every breakpoint.
- Keep secrets in env vars; never commit keys.

Work phase by phase. After each phase, run the smoke tests / backtest, report results, and commit.
Start with Phase 1.

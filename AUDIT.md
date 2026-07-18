# footy-mp — Production Audit & 2026→2030 Roadmap

*Audited 2026-07-17 (two days before the Spain–Argentina final). Covers the full
repo: Next.js app, Python ETL + model, CI, database, security. Every finding was
verified against the code and the live database; the fixes marked ✅ shipped in
this pass.*

---

## 1. Where the project stood

The foundation is real and unusual: a free-tier stack that ingests 27k+ data
points across 4,275 matches, an xG Dixon-Coles model that provably beats its
baseline, LLM match commentary grounded in a data dossier, and a coherent design
system. M0–M3 are honestly complete. But between "works for the World Cup" and
"carries you to 2030," the audit found five structural problems and a set of
production gaps.

### The five structural problems

**1. Identity fractured across competitions (fixed ✅).** Teams were keyed on
`(name, league_id)`, so Liverpool-in-the-Premier-League and
Liverpool-in-the-Champions-League were *different rows* — the live DB had **85
duplicated teams** (every UCL/UEL club, every multi-tournament national team).
Players forked the same way on transfer. Follows, ratings, and history splintered
with them. A promotion/relegation or a summer transfer would have quietly
corrupted four years of tracking.
→ *Fixed:* migration `002` merges all 85 dupes and repoints every FK;
`data/db.py` now resolves teams by `espn_id` → global name (league changes
update in place and log a movement), players by `understat_id` → global name
(transfers update in place and log a movement). A partial unique index on
`espn_id` makes regression impossible.

**2. The 4-year arc went dark after the final (fixed ✅).** Only 10 competitions
were ingested — the big-5, UCL/UEL, and three finals tournaments. **No World Cup
qualifiers, no Nations League, no AFCON/Gold Cup, no friendlies** — i.e., no
international football at all between tournaments, exactly when the road to 2030
is being decided.
→ *Fixed:* the registry (`data/normalize.py`) now carries **27 competitions**,
adding all six confederations' WC qualifiers, UEFA Nations League, AFCON, Gold
Cup, international friendlies, Copa Libertadores, Championship (the promotion
pipeline), MLS, Primeira Liga, Eredivisie, and Colombia's Primera A. All slugs
verified against the live ESPN API.

**3. The model mispriced whole classes of matches (fixed ✅).**
`is_international` doubled as both "neutral venue" and "knockout" — so every
Champions League group game lost home advantage, and every World Cup *group*
game got extra-time/penalty math it can't have.
→ *Fixed:* matches now carry `phase` (ESPN's `season.slug`) and a derived
`is_knockout`; leagues carry `format` (league/cup/tournament/qualifiers/
friendly). Neutrality = tournaments + cup finals only. Knockout = phases that
actually go to extra time (two-legged cup rounds correctly excluded). 15/15
semantic tests pass; pre-migration DBs fall back to the old behavior gracefully.

**4. Season identity didn't exist (fixed ✅).** `matches.season` was never
written; the only time-awareness was a recency half-life. Cross-season
questions ("how did this club do last year?") had no data to stand on.
→ *Fixed:* every ingested match is stamped (`2026-27` club-style, `2026`
calendar/tournament-style, from ESPN's season year); `python -m data.pipeline
seasons` backfills history.

**5. Nothing watched how things move (fixed ✅).** Transfers and
promotion/relegation — the exact "how does everything connect" knowledge you
asked for — were invisible; a moved player just silently forked (see #1).
→ *Fixed:* a `movements` table records every club change (transfer) and league
change (promotion/relegation) the pipeline notices, surfaced as the
**Movement** feed on Today.

### Security posture (fixed ✅)

- **No RLS on any table** while the anon key ships to every browser — the DB was
  world-writable through PostgREST. → Migration 002 enables RLS everywhere:
  anon = read-only, all writes via service role.
- `/api/refresh` was a public unauthenticated endpoint holding the service-role
  key. → Same-origin guard + it now only queries scoreboards for competitions
  with matches ±36h (1–4 calls instead of 24). `/api/follows` moved from the
  anon client (which RLS would have broken) to the service client with the same
  guard.
- Dead `@supabase/ssr` session middleware that refreshed no session → deleted.
- For true privacy later: flip on Vercel Deployment Protection (dashboard
  setting, zero code).

### Model & pipeline hygiene

- **The backtest gate never gated** — it existed only as a manual dispatch, so a
  regressed model could ship daily. → The 06:00 job now runs
  `backtest` *before* `model`; a failure blocks predictions. ✅
- **The Lowdown ran ~60 Opus calls/day uncapped.** → Analyst passes moved to
  Sonnet (Opus kept for the final synthesized voice), plus a hard per-run call
  ceiling (`LOWDOWN_MAX_CALLS`, default 60 ≈ 12 matches). Roughly a 70% cost
  cut at equal output volume. ✅
- CI: job timeouts added; the soccerdata cache key now rotates daily instead of
  never hitting. ✅
- Still open (see roadmap): no failure alerting on cron runs; `fetch_summary`
  (ESPN team stats) and the FBref path are wired but unused.

### Web app production gaps

| Gap | Status |
|---|---|
| No loading states (blank screen on every nav, `force-dynamic` everywhere) | ✅ skeleton `loading.tsx` in both panes |
| No error boundaries (DB blip = white page) | ✅ `error.tsx` in both panes + retry |
| No custom 404 | ✅ `not-found.tsx` |
| Generic `<title>` on every page, no favicon, no manifest, no `public/` at all | ✅ per-entity `generateMetadata`, icon, PWA manifest, `robots: noindex` (personal tool) |
| Tables screen fired ~100 queries per load (per-team form lookups × 5 leagues) | ✅ form now derived from matches already fetched — zero extra queries |
| Knockout predictions (`p_advance`, `p_et`, `p_pens`) computed but never rendered | ✅ "If it stays level" panel on knockout match pages — live for Sunday's final |
| Hardcoded competition filter chips; stale WC-moment microcopy | ✅ chips derive from live data; copy is evergreen |
| Duplicate TABS arrays in header/tab bar | ✅ single `tabs.ts` source |
| ESLint wasn't installed — CI "lint" was a no-op | ✅ installed, repo lints clean |
| DS components are `@ts-nocheck` prototypes | ⚠ open (contained behind one shim) |
| `<div onClick>` navigation isn't keyboard-accessible | ⚠ open |
| No tests beyond the model backtest | ⚠ open |

---

## 2. What's new for "0 → 100"

Your definition of 0→100 — *the logistics: how players, clubs, and national
teams interlock and move* — is now a first-class product surface:

- **The Map** (`/map`, in the main nav): how the four layers pass players
  around — leagues → continental cups → international windows → the 4-year
  cycle; promotion/relegation, two-legged ties, transfer windows; a
  **road-to-2030 timeline**; and a live "what's next in every competition"
  index. Written to be read once and referred back to for four years.
- **The club↔country web**: country pages show **Where the squad plays**
  (national pool grouped by employer club); club pages show **National teams
  fed** (squad grouped by passport). Powered by a new weekly **rosters** ingest
  that pulls every national team's squad from ESPN — nationality, DOB, position,
  photo, and the player's club, resolved into our teams graph.
- **Movement feed** on Today: every transfer and promotion/relegation the
  pipeline notices, permanently logged.
- **Road to 2030 module** on Today: the next date in every international
  competition, so the arc to the next World Cup is always one glance away.

---

## 3. Deployment runbook (do these in order)

1. **Apply the migration** — paste `data/db/migrations/002_backbone.sql` into
   the Supabase SQL editor and run it (idempotent; merges the 85 dupes, adds
   phase/format/movements/indexes/RLS). ~2 minutes.
2. **Push to GitHub** — commits are ready on `main`; Vercel redeploys the web
   app automatically.
3. **Run once, by hand** (Actions → ingest → dispatch):
   `daily` (picks up new competitions + stamps phases), then `seasons`
   (backfills season labels), then `rosters` (builds the club↔country web),
   then `model` (re-prices with correct venue/knockout semantics).
4. Optionally set `LOWDOWN_MAX_CALLS` / `LOWDOWN_ANALYST_MODEL` repo variables
   to tune spend; defaults are sane.

---

## 4. Roadmap to 2030

**Now → club season kickoff (Aug 2026):** watch the first weeks of ingest across
the 17 new competitions; extend `TEAM_ALIASES` as unmatched names surface in
logs; tune Today's ordering as data broadens.

**2026-27 season (the habit year):** group/qualifying **tables for
internationals** (needs group labels — ESPN carries them per event; ingest, then
render qualifying tables per confederation); notifications for followed
entities (movement + lineups + results digest); wire `fetch_summary` for shots/
possession on finished matches; a lightweight "who is this club/player"
onboarding card the first time an entity is opened.

**2027-2029 (the qualifying marathon):** availability adjustment from the
pre-match lineups the live cron already sees; promotion/relegation season
transitions verified end-to-end (the movements log makes this observable);
model v3 — refit ET/pens cascade on the much larger knockout sample, per-
confederation HFA for qualifiers; bracket view for tournaments.

**2029-30 (the payoff):** squad-lock tracker per country (who's qualifying,
who's in form, who plays where — all data already flowing); WC2030 bracket +
advancement simulations; four seasons of history under every entity page.

---

## 5. Verification of this pass

- `python -m compileall data/` clean; 15/15 phase/neutrality unit checks pass.
- Season labeling verified across cross-year, calendar, and tournament styles.
- All 17 new ESPN slugs return live data (spot-checked with real dates).
- Roster endpoint verified (France: 26 players, clubs + citizenship resolved);
  core-API club resolution verified (id 103 → AC Milan).
- Model loads + fits against the **live pre-migration DB** (4,273 matches, 203
  teams) through the compatibility path — proving deploy order can't break
  prod. Sunday's final prices Spain 58/24/17 over Argentina, 60% to lift the
  cup, 24% extra time.
- `tsc --noEmit`, `next build`, and `next lint` all pass clean.

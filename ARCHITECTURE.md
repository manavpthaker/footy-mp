# footy-mp — Architecture & Spec

A year-round football tracker + prediction engine. Follow players, teams, leagues, and
countries; keep a live dashboard of everything you care about; and run a genuinely
data-backed match model that improves on the World Cup 2026 visualizer's engine.

Born out of the WC26 project (`mpthaker-xyz/public/wc26.html`). We port the model,
the extra-time / penalty logic, the data-derived "nerves" factor, and the Charter
design system, then rebuild on real data instead of FIFA-points proxies.

---

## 1. Goals

1. **Follow** — players, teams, leagues, countries. A personal watchlist that persists.
2. **Track** — fixtures, live scores, results, form, and rich stats for everything followed.
3. **Model** — a match-prediction engine measurably more accurate than the WC26 model,
   because it's fed real expected-goals and shot data rather than FIFA-ranking proxies.

Constraint that shapes every choice below: **free data sources only.**

---

## 2. Stack (all free tier)

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | **Next.js 14 (App Router) on Vercel** | Matches the Grapevines stack; free hosting; server components + API routes in one repo. |
| Backend | **Next.js API routes / serverless functions** | No separate server to run; scales to zero; free on Vercel. |
| Database | **Supabase (Postgres)** | Already used for Grapevines; generous free tier; SQL + row-level security + instant REST. |
| ETL + Model | **Python** (`data/`) | The model is math-heavy; Python has the football data libs and stats tooling. |
| Scheduling | **GitHub Actions cron** (free) | Pulls data on a schedule into Supabase. Vercel Cron free tier is too limited for our cadence. |
| Design | **Quant Desk** (see `design/`) | Dark warm-charcoal terminal aesthetic — Spline Sans Mono, ember-orange primary, steel-cyan secondary, tape-gold follow layer. Supersedes the original "Charter" plan; the authoritative UI spec is `design/handoff-mobile/` + `CLAUDE_CODE_PROMPT.md`. |

Data flows: **GitHub Actions (Python ETL) → Supabase → Next.js API routes → React dashboard.**
The model runs in the ETL layer, writes ratings + predictions to Supabase, and the app just reads them.

---

## 3. Data sources (free)

We use two complementary free sources. ESPN gives breadth and live coverage; FBref/Understat
give the depth (xG, shots) the model needs.

### ESPN public API (breadth + live)
- Base: `https://site.api.espn.com/apis/site/v2/sports/soccer/{league}/scoreboard?dates=YYYYMMDD`
- Match detail / play-by-play: `.../summary?event={id}`
- Gives: fixtures, live scores, results, lineups, cards, subs, basic team stats, penalty shootouts.
- Free, no key, but **shallow on advanced stats and has no true xG.**
- League slugs we already validated: `eng.1`, `esp.1`, `ita.1`, `ger.1`, `fra.1`, `uefa.champions`,
  `fifa.world`, `conmebol.america`, `uefa.euro`, plus qualifiers (`fifa.worldq.*`).

### FBref + Understat (depth: xG, shots)
- Accessed via the **`soccerdata`** Python library (wraps FBref/Understat/others cleanly —
  no fragile hand-rolled scraping, respects rate limits). Alternatives: `understatapi`, `worldfootballR`.
- Gives: per-match team xG / xGA, shot-level data, player xG/xA, npxG, progressive actions,
  minutes, positions. **This is what makes the model better.**
- Coverage: the big-5 European leagues + top competitions (Understat), far wider for FBref.
- Cadence: pulled daily; historical backfill once, then incremental.

> Compliance note: we only use `mcp__workspace__web_fetch` / established libraries for retrieval,
> never curl/scraping around blocks. `soccerdata` caches locally and throttles politely.

---

## 4. Data model (Supabase Postgres)

Full DDL in `data/db/schema.sql`. Overview:

- **countries** — id, name, fifa_code, confederation.
- **leagues** — id, name, country_id, espn_slug, understat_slug, tier.
- **teams** — id, name, short_name, country_id, league_id, espn_id, fbref_id, crest_url.
- **players** — id, name, team_id, country_id, position, dob, fbref_id, photo_url.
- **matches** — id, league_id, home_team_id, away_team_id, kickoff_utc, status,
  home_goals, away_goals, went_et, went_pens, pens_home, pens_away, espn_event_id.
- **team_match_stats** — match_id, team_id, xg, xga, shots, sot, possession, corners,
  fouls, yellow, red. (The model's fuel.)
- **player_match_stats** — match_id, player_id, minutes, goals, assists, xg, xa, npxg,
  shots, sot, key_passes, cards.
- **follows** — user_id, entity_type ('player'|'team'|'league'|'country'), entity_id.
  (Single-user for now; user_id defaults to 'mp'.)
- **model_ratings** — team_id, as_of_date, attack, defense, overall, home_adv, temper.
- **predictions** — match_id, p_home, p_draw, p_away, home_xg, away_xg, p_advance_home,
  p_et, p_pens, model_version, created_at.

---

## 5. The model — why it beats WC26

The WC26 engine (kept as the baseline) built team strength from **z-scored FIFA points +
group-stage goals/form**, then ran a Poisson goals model with a matchup gamma, plus knockout
extra-time / penalty math and a data-derived "nerves" factor. Its proven weaknesses (from our
own backtest across 19 knockout games): it under-forecast extra time in favorite-vs-live-dog
games, and it mispriced teams whose group/schedule was misleading (Belgium under-rated, etc.).

footy-mp fixes the root cause — **crude proxies** — with real data:

1. **xG-based Dixon-Coles.** Team attack/defense strength estimated from actual **xG for/against**
   (recency-weighted), not goals or FIFA points. xG is far more predictive of future results than
   goals because it strips finishing luck. This is the single biggest accuracy lever.
2. **Dixon-Coles low-score correction** — fixes the independent-Poisson flaw we hit in the WC app
   (it under-produced draws). Adds the tau adjustment for 0-0/1-0/0-1/1-1.
3. **Home advantage as a fitted parameter**, per league (recency-weighted, pooled
   fallback for sparse leagues), not a flat constant. *(Implemented in v2 — metric-neutral
   on big-5-only data, matters as league coverage widens.)*
4. **Availability adjustment** — down-weight a team's attack/defense when key players (by minutes
   share + xG/xGA contribution) are injured/suspended. **Deferred:** there is no free
   pre-match injury/absence feed. The path is capturing ESPN pre-match lineups via the
   15-minute live cron and diffing against the season's minutes leaders; until then the
   AVAIL factor in the UI reads 0.
5. **Keep what worked:** the ET → penalty shootout cascade, the shootout-record edge, and the
   nerves/temperament tilt — but re-fit them on the larger dataset instead of curated priors.
6. **Walk-forward backtesting built in** — RPS, log-loss, Brier, and calibration, run every time
   the model changes, so "more accurate" is proven, not asserted. Ported from `backtest_v2.py`.

Model lives in `data/model/`. It reads `team_match_stats` from Supabase, fits ratings, writes
`model_ratings` + `predictions` back. Versioned (`model_version`) so we can A/B old vs new.

---

## 6. Repo layout

```
footy-mp/
  ARCHITECTURE.md            <- this file (stack, schema, data, model)
  CLAUDE_CODE_PROMPT.md      <- build brief; UI phases + redesign spec
  design/                    <- Quant Desk handoff (tokens, DS components, screens)
  web/                       <- Next.js 14 App Router (parallel routes @rail/@detail)
    app/@rail/               <- list panes: Today / Matches / Tables / Following
    app/@detail/             <- pushed detail stacks: matches/teams/players/leagues/countries
    app/api/follows/         <- follow toggle API
    components/ds/           <- ported Quant Desk DS components
    components/screens/      <- the four tab screens
    lib/data.ts              <- single server-side Supabase data layer
    styles/                  <- Quant Desk tokens (colors/fonts/spacing/typography)
  data/                      <- Python ETL + model
    db/schema.sql
    pipeline.py              <- orchestrator; modes: daily/live/backfill/players/seed/model/backtest
    ingest/espn.py           <- fixtures/results/live/shootouts (no key needed)
    ingest/stats.py          <- Understat xG + player-match stats via soccerdata
    model/engine.py          <- xG Dixon-Coles + per-league HFA + ET/pens cascade
    model/pipeline.py        <- fit ratings, write model_ratings + predictions
    model/backtest.py        <- walk-forward gate vs goals-only baseline (exits non-zero on fail)
    seed_follows.py, seed_countries.py
  .github/workflows/
    ingest.yml               <- daily (ingest+model), guarded live 15-min, manual modes
    web.yml                  <- Next.js build check
```

---

## 7. Milestones

- **M0 — Foundation:** spec, schema, repo scaffold, ESPN ingest client, model port. ✅
- **M1 — Data flowing:** Supabase live, ESPN + Understat ingest on cron, follows seeded. ✅
- **M2 — Model:** xG Dixon-Coles fit + predictions in DB; enforced backtest gate vs the
  goals-only baseline (v2: RPS 0.1995 vs 0.2088). ✅
- **M3 — App:** Quant Desk 4-tab mobile shell + desktop rail-and-detail; entity pages
  incl. countries; predictions and live view surfaced. ✅ (see `CLAUDE_CODE_PROMPT.md` phases)
- **M4 — All leagues, all teams, all players (current):** player-match stats across big-5
  seasons, broader league coverage beyond big-5 + internationals, availability adjustment
  once a lineup source exists, notifications/live polish.

---

## 8. Known limitations / next bets

- **Understat covers the big-5 only** — player stats and xG beyond those leagues need
  another source (FBref currently CAPTCHA-blocks scrapers; revisit politely or find an API).
- **Availability adjustment deferred** — no free injury feed; capture ESPN pre-match
  lineups via the live cron as the path in.
- **Historical placeholder kickoffs** — pre-2025-26 club matches came from Understat
  with synthetic 15:00Z kickoff times; ESPN sweeps claim/fix them season by season
  (2025-26 done).
- **Single user** — `follows.user_id` hardcoded to `mp`; auth plumbing (@supabase/ssr)
  is wired but ungated.

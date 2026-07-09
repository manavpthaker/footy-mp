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
| Design | **The Charter** (ported from WC26) | Warm paper, warm ink, one flame accent, Schibsted Grotesk + JetBrains Mono. |

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
3. **Home advantage as a fitted parameter**, per league, not a flat constant.
4. **Availability adjustment** — down-weight a team's attack/defense when key players (by minutes
   share + xG/xGA contribution) are injured/suspended. Player data makes this possible.
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
  ARCHITECTURE.md            <- this file
  web/                       <- Next.js app (frontend + API routes)
    app/
      page.tsx               <- dashboard (followed entities)
      players/[id]/page.tsx  <- player page
      teams/[id]/page.tsx    <- team page
      leagues/[id]/page.tsx  <- league table + fixtures
      api/                   <- route handlers over Supabase
    lib/supabase.ts
    lib/charter.css          <- ported Charter design tokens
  data/                      <- Python ETL + model
    db/schema.sql
    ingest/espn.py           <- fixtures/results/live (ported from WC sync)
    ingest/stats.py          <- FBref/Understat via soccerdata (xG/shots)
    model/ratings.py         <- xG Dixon-Coles fit
    model/predict.py         <- match predictions + ET/pens cascade
    model/backtest.py        <- walk-forward validation (ported)
    requirements.txt
  .github/workflows/ingest.yml  <- scheduled data pulls
```

---

## 7. Milestones

- **M0 — Foundation (this session):** spec, schema, repo scaffold, ESPN ingest client, model port.
- **M1 — Data flowing:** Supabase live, ESPN + Understat ingest populating tables, seed the follow list.
- **M2 — Model v1:** xG Dixon-Coles fit + predictions written to DB; backtest vs WC26 baseline.
- **M3 — Dashboard:** Next.js follow + dashboard slice reading from Supabase; player/team/league pages.
- **M4 — Polish:** Charter styling, live match view (reuse WC lowdown voice), predictions surfaced in UI.

---

## 8. Open items to confirm

- **Follow list to seed** — which players/teams/leagues/countries to start with (Colombia core +
  the players Manav named). Drives the initial ingest scope.
- **League coverage for v1** — Understat's xG covers the big-5 European leagues cleanly; start there,
  expand via FBref. International (national teams) via ESPN + FBref.

# footy-mp (MPFC)

World football, 0→100: a four-year companion from World Cup 2026 to 2030. Follow
players, clubs, leagues, and national teams; understand how they interlock (The
Map, the club↔country web, the movement log); and run an xG-based match model
that improves on the World Cup 2026 visualizer's engine.

**Full design → [`ARCHITECTURE.md`](./ARCHITECTURE.md)** ·
**Audit + roadmap → [`AUDIT.md`](./AUDIT.md)** ·
**UI spec → [`CLAUDE_CODE_PROMPT.md`](./CLAUDE_CODE_PROMPT.md) + `design/`**

## Stack (all free tier)
Next.js on Vercel · Supabase Postgres · Python ETL + model · GitHub Actions cron ·
free data (ESPN + Understat via soccerdata) · Quant Desk design system.

## Repo
```
ARCHITECTURE.md            design + decisions
AUDIT.md                   production audit + 2026→2030 roadmap
data/
  db/schema.sql            Supabase schema (baseline incl. migration 002)
  db/migrations/           run 002_backbone.sql once on an existing DB
  pipeline.py              orchestrator — modes: daily/live/backfill/players/seed/
                           model/backtest/lowdown/rosters/seasons
  lowdown.py               "The Lowdown" — hybrid Sonnet/Opus match commentary
  ingest/espn.py           fixtures/results/live/shootouts/phases + NT rosters (no key)
  ingest/stats.py          xG + player-match stats via soccerdata (Understat)
  model/engine.py          xG Dixon-Coles + per-league HFA + ET/pens cascade + nerves
  model/backtest.py        walk-forward gate vs goals baseline (runs in daily CI)
  normalize.py             THE competition registry: 27 comps, formats, seasons, aliases
.github/workflows/
  ingest.yml               daily (gate→model) · guarded 15-min live · weekly rosters
  web.yml                  Next.js build check
web/                       Next.js app — 5-tab shell (incl. The Map), rail+detail
```

## Status
- [x] M0 foundation — schema, ingest clients, model port
- [x] M1 data flowing — Supabase live, daily cron (ingest → model → predictions)
- [x] M2 model — footy-mp-v2 beats the goals-only baseline (RPS 0.1995 vs 0.2088,
      gate now enforced in the daily CI run)
- [x] M3 app — Today/Matches/Tables/Following + match/team/player/league/country
      detail, predictions + live view surfaced
- [x] M4 backbone — identity continuity (85 dupes merged), seasons, phases,
      real knockout/neutral semantics, RLS, 27 competitions incl. all WC
      qualifiers · Nations League · AFCON · Gold Cup · friendlies
- [x] M5 the 0→100 layer — The Map, club↔country squad webs (weekly rosters
      ingest), movement log, road-to-2030 modules, knockout odds surfaced
- [ ] M6 depth — intl group tables, notifications, availability from lineups,
      bracket views, model v3 (see AUDIT.md roadmap)

## Quick start (local)
```bash
pip install -r data/requirements.txt
cp .env.example .env                  # add SUPABASE_URL + SUPABASE_SERVICE_KEY
# existing DB? run data/db/migrations/002_backbone.sql in the Supabase SQL editor
python -m data.pipeline daily         # ingest recent fixtures/results + xG
python -m data.pipeline seasons       # one-time: stamp historical season labels
python -m data.pipeline rosters       # national-team squads -> club↔country web
python -m data.pipeline model         # fit ratings, write predictions
python -m data.pipeline backtest      # prove the model still beats the baseline
cd web && npm i && npm run dev        # app on :3000
```
GitHub Actions runs `daily` (ingest → backtest gate → model → lowdown) at 06:00
UTC, a guarded `live` refresh every 15 minutes, and `rosters` weekly on Mondays
(secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, optional `ANTHROPIC_API_KEY`).

## What makes the model better than WC26
WC26 built team strength from FIFA points + goals. footy-mp uses **real expected goals**
(opponent-adjusted, recency-weighted) with a Dixon-Coles low-score correction, a fitted
home advantage, and player-availability adjustments — plus the ET/penalty cascade and
nerves factor that backtested well. Every model change is validated by walk-forward
RPS / log-loss / Brier before it ships.

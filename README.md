# footy-mp (MPFC)

A year-round football tracker + prediction engine. Follow players, teams, leagues, and
countries; keep a live dashboard; and run an xG-based match model that improves on the
World Cup 2026 visualizer's engine.

**Full design → [`ARCHITECTURE.md`](./ARCHITECTURE.md)** ·
**UI spec → [`CLAUDE_CODE_PROMPT.md`](./CLAUDE_CODE_PROMPT.md) + `design/`**

## Stack (all free tier)
Next.js on Vercel · Supabase Postgres · Python ETL + model · GitHub Actions cron ·
free data (ESPN + Understat via soccerdata) · Quant Desk design system.

## Repo
```
ARCHITECTURE.md            design + decisions
data/
  db/schema.sql            Supabase schema
  pipeline.py              orchestrator — modes: daily/live/backfill/players/seed/model/backtest/lowdown
  lowdown.py               "The Lowdown" — multi-agent LLM match commentary (Claude API)
  ingest/espn.py           fixtures / results / live / shootouts  (works, no key)
  ingest/stats.py          xG + player-match stats via soccerdata (Understat)
  model/engine.py          xG Dixon-Coles + per-league HFA + ET/pens cascade + nerves
  model/backtest.py        walk-forward gate vs goals baseline (exits non-zero on fail)
.github/workflows/
  ingest.yml               daily ingest+model · guarded 15-min live · manual modes
  web.yml                  Next.js build check
web/                       Next.js app — Quant Desk 4-tab shell, desktop rail+detail
```

## Status
- [x] M0 foundation — schema, ingest clients, model port
- [x] M1 data flowing — Supabase live, daily cron (ingest → model → predictions)
- [x] M2 model — footy-mp-v2 beats the goals-only baseline (RPS 0.1995 vs 0.2088,
      enforced gate in CI)
- [x] M3 app — Today/Matches/Tables/Following + match/team/player/league/country
      detail, predictions + live view surfaced
- [ ] M4 all leagues · all teams · all players — player backfill across seasons,
      coverage beyond big-5, availability adjustment (needs a lineup source)

## Quick start (local)
```bash
pip install -r data/requirements.txt
cp .env.example .env                  # add SUPABASE_URL + SUPABASE_SERVICE_KEY
python -m data.pipeline daily         # ingest recent fixtures/results + xG
python -m data.pipeline model         # fit ratings, write predictions
python -m data.pipeline backtest      # prove the model still beats the baseline
cd web && npm i && npm run dev        # app on :3000
```
GitHub Actions runs `daily` + `model` at 06:00 UTC and a guarded `live` refresh
every 15 minutes (secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`).

## What makes the model better than WC26
WC26 built team strength from FIFA points + goals. footy-mp uses **real expected goals**
(opponent-adjusted, recency-weighted) with a Dixon-Coles low-score correction, a fitted
home advantage, and player-availability adjustments — plus the ET/penalty cascade and
nerves factor that backtested well. Every model change is validated by walk-forward
RPS / log-loss / Brier before it ships.

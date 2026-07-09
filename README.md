# footy-mp

A year-round football tracker + prediction engine. Follow players, teams, leagues, and
countries; keep a live dashboard; and run an xG-based match model that improves on the
World Cup 2026 visualizer's engine.

**Full design → [`ARCHITECTURE.md`](./ARCHITECTURE.md)**

## Stack (all free tier)
Next.js on Vercel · Supabase Postgres · Python ETL + model · GitHub Actions cron ·
free data (ESPN + FBref/Understat) · The Charter design system.

## Repo
```
ARCHITECTURE.md            design + decisions
data/
  db/schema.sql            Supabase schema (run in SQL editor)
  ingest/espn.py           fixtures / results / live / shootouts  (works, no key)
  ingest/stats.py          xG + shots via soccerdata (FBref/Understat)
  model/engine.py          xG Dixon-Coles + ET/pens cascade + nerves + backtest
  requirements.txt
.github/workflows/ingest.yml   scheduled data pulls
web/                       Next.js app (coming next)
```

## Status — M0 (foundation) done
- [x] Architecture + schema
- [x] ESPN ingest client (verified against real match data)
- [x] xG stats client (soccerdata)
- [x] Model engine ported + upgraded to xG Dixon-Coles (verified end-to-end)
- [ ] Supabase project + tables live
- [ ] Understat backfill + model fit + backtest vs WC26 baseline
- [ ] Next.js follow + dashboard

## Quick start (local)
```bash
pip install -r data/requirements.txt
python data/ingest/espn.py           # smoke test ESPN
python data/model/engine.py          # smoke test model
```
Then create a Supabase project, run `data/db/schema.sql`, and set
`SUPABASE_URL` / `SUPABASE_SERVICE_KEY` as GitHub secrets.

## What makes the model better than WC26
WC26 built team strength from FIFA points + goals. footy-mp uses **real expected goals**
(opponent-adjusted, recency-weighted) with a Dixon-Coles low-score correction, a fitted
home advantage, and player-availability adjustments — plus the ET/penalty cascade and
nerves factor that backtested well. Every model change is validated by walk-forward
RPS / log-loss / Brier before it ships.

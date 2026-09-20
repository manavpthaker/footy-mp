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
  lowdown.py               "The Lowdown" — hybrid OpenAI match commentary
  ingest/espn.py           fixtures/results/live/shootouts/phases + NT rosters (no key)
  ingest/stats.py          xG + player-match stats via soccerdata (Understat)
  model/engine.py          xG Dixon-Coles + per-league HFA + ET/pens cascade + nerves
  model/backtest.py        walk-forward gate vs goals baseline (runs in daily CI)
  normalize.py             THE competition registry: 27 comps, formats, seasons, aliases
.github/workflows/
  ingest.yml               daily (gate→model) · guarded 15-min live · weekly rosters
  web.yml                  Next.js build check
web/                       Next.js app — 6-tab shell (incl. The Map + News wire), rail+detail
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
(secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, optional `OPENAI_API_KEY`).

## What makes the model better than WC26
WC26 built team strength from FIFA points + goals. footy-mp uses **real expected goals**
(opponent-adjusted, recency-weighted) with a Dixon-Coles low-score correction, a fitted
home advantage, and player-availability adjustments — plus the ET/penalty cascade and
nerves factor that backtested well. Every model change is validated by walk-forward
RPS / log-loss / Brier before it ships.

## Follow football through connections

The home screen starts from a club or national team, with Bayern as the initial
example when followed. Switch among followed teams or open `/?team=ID` from any
team page. Player cards connect current clubs, countries and verified career
history; country links lead to players at other clubs. League and cup links
explain why those clubs meet. Results, standings and schedules sit behind an
optional catch-up section. The wider football feed remains at `/world`.

Bayern recognition examples (Kane, Díaz, Olise and Musiala) cite the club's own
career profiles. Current club rosters are checked against ESPN when available;
stored player pools are labelled when a current roster cannot be checked.
Nationality is not proof of a current call-up. Other-country club connections
can lag transfers, and individual player statistics may be incomplete.
Standings prefer ESPN source tables, preserving conference/group boundaries, points deductions, and source tie-break order. If a domestic source table is unavailable, a labelled calculation from loaded results is shown. National competitions do not fall back to a fabricated combined table.

Scheduled kickoff times are checked against ESPN's `timeValid`; failed or
conflicting confirmation is explicit. The October 6 Colombia–Peru time remains
unverified because ESPN and the September 17 federation announcement disagree.

### Recover a stale fixture feed

ESPN rejected the old custom User-Agent. The standard Python client works in the
verified run; scoreboard failures now fail the ingest job instead of becoming
empty matchdays. An ESPN-only mode refreshes results without depending on xG or
AI providers. Export the usual Supabase credentials first, then run:

```bash
PIPELINE_DAYS_BACK=50 PIPELINE_DAYS_FORWARD=21 python -m data.pipeline fixtures
# Optional: PIPELINE_ESPN_LEAGUES='Bundesliga,Serie A,Saudi Pro League,Int. Friendlies'
```

### Refresh all published schedules and player clubs

```bash
python -m data.pipeline refresh
# To refresh club/national player lists without calendars:
PIPELINE_REFRESH_ROSTERS_ONLY=1 python -m data.pipeline refresh
```

`refresh` reads the current and next calendar year for every tracked competition,
then current domestic club catalogues/rosters and national-team player lists.
MLS is included. Only published fixtures are available; a future season or
knockout opponent may not have been announced. Truncated calendars and provider
errors fail the run, while unpublished national rosters are listed separately.
The JSON report at `/tmp/footy-refresh-report.json` records coverage and gaps.

A separate 05:30 UTC daily job runs this refresh independently of Understat,
model, or AI failures and retains its report in Actions for 14 days. Existing
15-minute score updates remain. `/explore` provides MLS clubs and national
teams; `/tables` presents MLS conferences and national competition groups.

Club and country links are reconciled conservatively by name and compatible
birth date. Ambiguous identities are reported rather than merged. A club roster
entry whose source default club has changed is excluded so it cannot move a
player back after a transfer. National source lists can cover a player pool,
not a confirmed squad for the next game. Individual xG/stat backfills still
use the separate `players` pipeline.

Verification:

```bash
python -m unittest discover -s data/tests -v
cd web
node --experimental-strip-types --test tests/*.test.mjs # Node 22.6+
npm run lint
npm run build
```

## Add a chat key from your phone

The private local preview has a `/settings` screen (gear button) for an OpenAI
API key. It checks model access before saving, then takes effect on the next
chat request. Claude keys are not supported. No credential is returned by the
settings API or stored in browser storage.

Enable only on a loopback-bound Mac preview behind private Tailscale Serve:

```sh
cd web
FOOTY_LOCAL_SETTINGS=1 FOOTY_LOCAL_SETTINGS_ORIGIN=https://macbook.tail1c89f5.ts.net npm run start -- -p 3001 -H 127.0.0.1
```

Keys are saved outside the repository at
`~/Library/Application Support/footy-mp/chat.json`, with owner-only file
permissions. Removing the saved key falls back to `OPENAI_API_KEY` if configured.
Local key writes are disabled by default and on Vercel. `OPENAI_CHAT_MODEL` still
selects the model (default `gpt-5-mini`). The key check verifies authentication
and model access, not whether API billing has credit for a chat request.

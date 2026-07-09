"""
footy-mp orchestrator — the entrypoint the GitHub Action runs.

Modes (env var PIPELINE_MODE, or CLI arg):
    daily     — default. Pull ESPN scoreboard for the trailing 3d + next 7d,
                pull the current Understat season's xG, upsert into Supabase.
    backfill  — pull the last N seasons of Understat xG for the big-5 leagues.
                Controlled by PIPELINE_BACKFILL_SEASONS (comma-separated Understat
                season codes, e.g. "2223,2324,2425,2526").
    live      — quick refresh of matches marked 'live' or kicking off today.
    seed      — one-time: create the follows list from data/seed_follows.py.
    model     — Phase 2 hook: run the model pipeline after ingest.

Idempotent. Safe to re-run at any cadence.
"""
from __future__ import annotations

import os
import sys
import traceback
from datetime import datetime, timedelta, timezone

from data import db
from data.ingest import espn
from data.normalize import LEAGUE_SOURCES, canonical_team

DEFAULT_LEAGUES = [
    "Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1",
    "Champions League", "Europa League",
]


# -------------------------- ESPN ingest --------------------------

def _daterange(days_back: int, days_fwd: int):
    today = datetime.now(timezone.utc).date()
    for i in range(-days_back, days_fwd + 1):
        yield (today + timedelta(days=i)).strftime("%Y%m%d")


def _ensure_leagues(names: list[str]) -> dict[str, int]:
    ids = {}
    for name in names:
        espn_slug, us_slug = LEAGUE_SOURCES.get(name, (None, None))
        # infer country + international flag from name (rough but adequate for our list)
        is_intl = name in {"Champions League", "Europa League", "World Cup", "Euros", "Copa America"}
        ids[name] = db.get_or_create_league(
            name=name, espn_slug=espn_slug, understat_slug=us_slug,
            is_international=is_intl,
        )
    return ids


def ingest_espn(days_back: int = 3, days_fwd: int = 7,
                leagues: list[str] | None = None) -> int:
    leagues = leagues or DEFAULT_LEAGUES
    league_ids = _ensure_leagues(leagues)
    written = 0
    for name in leagues:
        espn_slug, _ = LEAGUE_SOURCES.get(name, (None, None))
        if not espn_slug:
            continue
        for day in _daterange(days_back, days_fwd):
            raw = espn.fetch_day(espn_slug, day)
            if not raw:
                continue
            rows = []
            for r in raw:
                home = canonical_team(r["home"]); away = canonical_team(r["away"])
                if not home or not away:
                    continue
                home_id = db.get_or_create_team(
                    name=home, league_id=league_ids[name], espn_id=str(r.get("home_espn_id") or ""),
                )
                away_id = db.get_or_create_team(
                    name=away, league_id=league_ids[name], espn_id=str(r.get("away_espn_id") or ""),
                )
                winner = None
                w_name = canonical_team(r.get("winner"))
                if w_name == home: winner = home_id
                elif w_name == away: winner = away_id
                rows.append({
                    "espn_event_id": r["espn_event_id"],
                    "league_id": league_ids[name],
                    "home_team_id": home_id,
                    "away_team_id": away_id,
                    "kickoff_utc": r["kickoff_utc"],
                    "status": r["status"],
                    "minute": r.get("minute"),
                    "home_goals": r.get("home_goals"),
                    "away_goals": r.get("away_goals"),
                    "went_pens": r.get("went_pens", False),
                    "pens_home": r.get("pens_home"),
                    "pens_away": r.get("pens_away"),
                    "winner_team_id": winner,
                })
            if rows:
                db.upsert_matches(rows)
                written += len(rows)
                print(f"[espn] {name} {day}: upserted {len(rows)} matches")
    return written


# -------------------------- Understat xG ingest --------------------------

def ingest_understat(seasons: list[str], leagues: list[str] | None = None) -> int:
    """Pull xG per team-match for the given Understat seasons, join to our matches
    by (league, date, home, away), and write team_match_stats rows.

    seasons: Understat two-year codes, e.g. '2526' for 2025/26. 4-digit codes accepted too.
    """
    from data.ingest import stats
    leagues = leagues or ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"]
    league_ids = _ensure_leagues(leagues)
    # only include leagues Understat covers
    understat_map = {n: LEAGUE_SOURCES[n][1] for n in leagues if LEAGUE_SOURCES[n][1]}
    if not understat_map:
        return 0
    written = 0
    for season in seasons:
        try:
            rows = stats.understat_team_xg(
                leagues={n: understat_map[n] for n in understat_map},
                seasons=(season,),
            )
        except Exception as e:
            print(f"[understat] season {season} failed: {e}")
            continue
        # index by (league_id, date, home, away) -> row
        for r in rows:
            league_name = _understat_league_to_ours(r.get("league"))
            if not league_name or league_name not in league_ids:
                continue
            league_id = league_ids[league_name]
            home = canonical_team(r.get("home")); away = canonical_team(r.get("away"))
            if not home or not away:
                continue
            home_id = db.get_or_create_team(home, league_id=league_id)
            away_id = db.get_or_create_team(away, league_id=league_id)

            # find/create the match. Understat rows carry only a date, not a UTC kickoff.
            match_id = _find_or_create_match(
                league_id, home_id, away_id, r.get("date"),
                home_goals=r.get("home_goals"), away_goals=r.get("away_goals"),
            )
            if not match_id:
                continue

            db.upsert_team_match_stats([
                {"match_id": match_id, "team_id": home_id, "is_home": True,
                 "xg": r.get("home_xg"), "xga": r.get("away_xg"),
                 "goals": _to_int(r.get("home_goals"))},
                {"match_id": match_id, "team_id": away_id, "is_home": False,
                 "xg": r.get("away_xg"), "xga": r.get("home_xg"),
                 "goals": _to_int(r.get("away_goals"))},
            ])
            written += 2
        print(f"[understat] season {season}: wrote {written} stat rows so far")
    return written


def _understat_league_to_ours(name) -> str | None:
    """Map Understat's league label back to our canonical league name."""
    if not name:
        return None
    for canon, (_, us) in LEAGUE_SOURCES.items():
        if us and (us == name or us.split("-", 1)[-1] == name):
            return canon
    # Understat sometimes returns just the tail label
    tail = str(name).split("-", 1)[-1].strip()
    for canon, (_, us) in LEAGUE_SOURCES.items():
        if us and us.split("-", 1)[-1] == tail:
            return canon
    return None


def _find_or_create_match(league_id: int, home_id: int, away_id: int,
                          date_str: str, home_goals=None, away_goals=None) -> int | None:
    """Match Understat row -> ESPN-created match by (league, date::date, home, away).
    If no ESPN match exists yet, create a placeholder we can enrich later."""
    if not date_str:
        return None
    # look up matches on the given calendar date
    c = db.client()
    day_start = f"{date_str}T00:00:00Z"
    day_end = f"{date_str}T23:59:59Z"
    hits = getattr(
        c.table("matches").select("id,kickoff_utc,home_team_id,away_team_id,status")
        .eq("league_id", league_id).eq("home_team_id", home_id).eq("away_team_id", away_id)
        .gte("kickoff_utc", day_start).lte("kickoff_utc", day_end).execute(),
        "data", None,
    ) or []
    if hits:
        return hits[0]["id"]
    # create a placeholder (no espn_event_id — Understat-only historical rows)
    row = {
        "league_id": league_id, "home_team_id": home_id, "away_team_id": away_id,
        "kickoff_utc": f"{date_str}T15:00:00Z",  # neutral placeholder time
        "status": "final" if home_goals is not None else "scheduled",
        "home_goals": _to_int(home_goals), "away_goals": _to_int(away_goals),
    }
    ins = getattr(c.table("matches").insert(row).execute(), "data", None) or []
    return ins[0]["id"] if ins else None


def _to_int(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None


# -------------------------- follows seed --------------------------

def seed_follows() -> None:
    from data.seed_follows import seed
    seed()


# -------------------------- entrypoint --------------------------

def _mode() -> str:
    if len(sys.argv) > 1:
        return sys.argv[1].strip().lower()
    return os.environ.get("PIPELINE_MODE", "daily").strip().lower()


def main() -> int:
    mode = _mode()
    print(f"[pipeline] mode={mode}")
    try:
        if mode == "daily":
            n = ingest_espn(days_back=3, days_fwd=7)
            # current-season xG on daily runs
            season = os.environ.get("PIPELINE_UNDERSTAT_SEASON", _current_understat_season())
            m = ingest_understat([season])
            print(f"[pipeline] daily done: {n} matches, {m} stat rows")
        elif mode == "live":
            ingest_espn(days_back=1, days_fwd=1)
        elif mode == "backfill":
            seasons = [s.strip() for s in os.environ.get(
                "PIPELINE_BACKFILL_SEASONS", "2223,2324,2425,2526").split(",") if s.strip()]
            print(f"[pipeline] backfill seasons: {seasons}")
            ingest_understat(seasons)
        elif mode == "seed":
            seed_follows()
        elif mode == "model":
            from data.model.pipeline import run as run_model
            run_model()
        else:
            print(f"unknown mode: {mode}")
            return 2
        return 0
    except Exception:
        traceback.print_exc()
        return 1


def _current_understat_season() -> str:
    """Understat encodes seasons as two 2-digit years, e.g. 2526 = 2025/26.
    A season spans Aug -> May, so before August we're still in last year's season."""
    now = datetime.now(timezone.utc)
    y = now.year % 100
    if now.month >= 8:
        return f"{y:02d}{(y + 1) % 100:02d}"
    return f"{(y - 1) % 100:02d}{y:02d}"


if __name__ == "__main__":
    sys.exit(main())

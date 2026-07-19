"""
footy-mp orchestrator — the entrypoint the GitHub Action runs.

Modes (env var PIPELINE_MODE, or CLI arg):
    daily     — default. Pull ESPN scoreboard for the trailing 3d + next 7d,
                pull the current Understat season's xG, upsert into Supabase.
    backfill  — pull the last N seasons of Understat xG for the big-5 leagues.
                Controlled by PIPELINE_BACKFILL_SEASONS (comma-separated Understat
                season codes, e.g. "2223,2324,2425,2526").
    live      — quick refresh of matches marked 'live' or kicking off today.
                Exits early (0) when no match is live or within ±3h of kickoff,
                so the 15-minute cron is nearly free outside matchdays.
    seed      — one-time: create the follows list from data/seed_follows.py.
    players   — Understat player-match stats (minutes/goals/xG/xA) for the big-5.
                Controlled by PIPELINE_PLAYER_SEASONS (default: current season).
                Slow uncached (~1 request per match), cheap once soccerdata's disk
                cache is warm.
    rosters   — national-team squads from ESPN: fills player nationality, DOB,
                photo and links each international to their CLUB (the club↔country
                web). Also detects transfers. Run weekly.
    seasons   — one-time backfill: stamp matches.season for historical rows.
    model     — Phase 2 hook: run the model pipeline after ingest.
    backtest  — walk-forward backtest vs the goals-only baseline; exits non-zero
                if the xG model does not beat the baseline on RPS and log-loss.
    lowdown   — LLM-written match commentary ("The Lowdown") for upcoming
                matches with predictions. Needs ANTHROPIC_API_KEY (skips
                gracefully without it). PIPELINE_LOWDOWN_LIMIT caps matches.

Idempotent. Safe to re-run at any cadence.
"""
from __future__ import annotations

import os
import sys
import traceback
from datetime import datetime, timedelta, timezone

from data import db
from data.ingest import espn
from data.normalize import (LEAGUES, LEAGUE_SOURCES, canonical_team,
                            is_knockout_phase, season_label)

DEFAULT_LEAGUES = list(LEAGUES.keys())


# -------------------------- ESPN ingest --------------------------

def _daterange(days_back: int, days_fwd: int):
    today = datetime.now(timezone.utc).date()
    for i in range(-days_back, days_fwd + 1):
        yield (today + timedelta(days=i)).strftime("%Y%m%d")


def _ensure_leagues(names: list[str]) -> dict[str, int]:
    ids = {}
    for name in names:
        L = LEAGUES.get(name)
        if L is None:
            espn_slug, us_slug = LEAGUE_SOURCES.get(name, (None, None))
            ids[name] = db.get_or_create_league(name=name, espn_slug=espn_slug,
                                                understat_slug=us_slug)
            continue
        ids[name] = db.get_or_create_league(
            name=name, espn_slug=L.espn, understat_slug=L.understat,
            is_international=L.format in ("tournament", "qualifiers", "friendly"),
            tier=L.tier, format=L.format,
        )
    return ids


def ingest_espn(days_back: int = 3, days_fwd: int = 7,
                leagues: list[str] | None = None) -> int:
    leagues = leagues or DEFAULT_LEAGUES
    league_ids = _ensure_leagues(leagues)
    written = 0
    for name in leagues:
        L = LEAGUES.get(name)
        espn_slug = L.espn if L else LEAGUE_SOURCES.get(name, (None, None))[0]
        fmt = L.format if L else "league"
        style = L.season_style if L else "cross"
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
                    name=home, league_id=league_ids[name],
                    espn_id=str(r.get("home_espn_id") or ""), league_format=fmt,
                    crest_url=r.get("home_logo"),
                )
                away_id = db.get_or_create_team(
                    name=away, league_id=league_ids[name],
                    espn_id=str(r.get("away_espn_id") or ""), league_format=fmt,
                    crest_url=r.get("away_logo"),
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
                    "went_et": r.get("went_et", False),
                    "went_pens": r.get("went_pens", False),
                    "pens_home": r.get("pens_home"),
                    "pens_away": r.get("pens_away"),
                    "winner_team_id": winner,
                    "phase": r.get("phase"),
                    "is_knockout": is_knockout_phase(fmt, r.get("phase")),
                    "season": season_label(fmt, style, r.get("season_year"),
                                           r.get("kickoff_utc")),
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
            home_id = db.get_or_create_team(home, league_id=league_id, league_format="league")
            away_id = db.get_or_create_team(away, league_id=league_id, league_format="league")

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
    """Match Understat row -> ESPN-created match by (league, home, away) within
    ±1 day of Understat's local match date (UTC kickoffs can drift a day).
    If no ESPN match exists yet, create a placeholder; ESPN ingest later claims
    it via db._claim_placeholder and overwrites kickoff/status."""
    if not date_str:
        return None
    c = db.client()
    from datetime import date as _date
    d = _date.fromisoformat(date_str[:10])
    day_start = f"{d - timedelta(days=1)}T00:00:00Z"
    day_end = f"{d + timedelta(days=1)}T23:59:59Z"
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
    if db.has_backbone():
        row["season"] = season_label("league", "cross", None, row["kickoff_utc"])
    ins = getattr(c.table("matches").insert(row).execute(), "data", None) or []
    return ins[0]["id"] if ins else None


def _to_int(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None


def _to_num(v):
    try:
        f = float(v)
        return f if f == f else None  # NaN guard (pandas)
    except (TypeError, ValueError):
        return None


# -------------------------- player-stats ingest (Understat) --------------------------

def ingest_player_stats(seasons: list[str], leagues: list[str] | None = None) -> int:
    """Player-level match stats (minutes, goals, assists, xG/xA, shots, key passes,
    cards) from Understat into `players` + `player_match_stats`. Big-5 leagues only
    (Understat's coverage). FBref was the original plan but blocks scrapers; Understat
    serves the same fields politely via soccerdata. Teams are looked up, never
    created, so a bad alias can't spawn duplicate teams — unmatched names are logged
    for the alias map."""
    from data.ingest import stats
    leagues = leagues or ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"]
    league_ids = _ensure_leagues(leagues)
    codes = {n: LEAGUE_SOURCES[n][1] for n in leagues if LEAGUE_SOURCES[n][1]}
    if not codes:
        return 0

    # preload caches: one round-trip each instead of one per stat row
    team_cache: dict[tuple[str, int], int | None] = {}
    player_cache: dict[tuple[str, int], int] = {}
    for p in db.page_all("players", "id,name,team_id"):
        if p.get("team_id"):
            player_cache[(p["name"], p["team_id"])] = p["id"]
    match_index: dict[tuple[int, str], int] = {}
    for m in db.page_all("matches", "id,home_team_id,away_team_id,kickoff_utc"):
        day = (m.get("kickoff_utc") or "")[:10]
        if not day:
            continue
        match_index[(m["home_team_id"], day)] = m["id"]
        match_index[(m["away_team_id"], day)] = m["id"]

    def _find_match(team_id: int, date_str: str) -> int | None:
        d = datetime.fromisoformat(date_str).date()
        for delta in (0, 1, -1):
            hit = match_index.get((team_id, str(d + timedelta(days=delta))))
            if hit:
                return hit
        return None

    written = 0
    unmatched: set[str] = set()
    for season in seasons:
        try:
            recs = stats.understat_player_match(leagues=codes, seasons=(season,))
        except Exception as e:
            print(f"[players] season {season} failed: {e}")
            continue
        batch: list[dict] = []
        for r in recs:
            league_name = _understat_league_to_ours(r.get("league"))
            if not league_name or league_name not in league_ids or not r.get("date"):
                continue
            lid = league_ids[league_name]
            team = canonical_team(r.get("team"))
            key = (team, lid)
            if key not in team_cache:
                team_cache[key] = db.find_team(team, lid)
            team_id = team_cache[key]
            if not team_id:
                unmatched.add(str(r.get("team")))
                continue
            match_id = _find_match(team_id, r["date"])
            if not match_id:
                continue
            pname = str(r.get("player") or "").strip()
            if not pname:
                continue
            pkey = (pname, team_id)
            if pkey not in player_cache:
                pos = str(r.get("position") or "") or None
                us_id = str(r.get("understat_id") or "") or None
                player_cache[pkey] = db.get_or_create_player(
                    pname, team_id=team_id, position=pos, understat_id=us_id)
            batch.append({
                "match_id": match_id, "player_id": player_cache[pkey], "team_id": team_id,
                "minutes": _to_int(r.get("minutes")), "goals": _to_int(r.get("goals")),
                "assists": _to_int(r.get("assists")), "xg": _to_num(r.get("xg")),
                "xa": _to_num(r.get("xa")),
                "shots": _to_int(r.get("shots")),
                "key_passes": _to_int(r.get("key_passes")),
                "yellow": _to_int(r.get("yellow")), "red": _to_int(r.get("red")),
            })
            if len(batch) >= 500:
                db.upsert_player_match_stats(batch)
                written += len(batch)
                batch = []
        if batch:
            db.upsert_player_match_stats(batch)
            written += len(batch)
        print(f"[players] season {season}: {written} player-match rows so far")
    if unmatched:
        print(f"[players] unmatched team names (extend TEAM_ALIASES): {sorted(unmatched)}")
    return written


# -------------------------- national-team rosters --------------------------

# competition slugs a national team's roster can be fetched under, tried in order
_ROSTER_SLUGS = ("fifa.world", "fifa.friendly", "fifa.worldq.uefa", "fifa.worldq.conmebol",
                 "fifa.worldq.concacaf", "fifa.worldq.afc", "fifa.worldq.caf",
                 "fifa.worldq.ofc", "uefa.nations")


def ingest_rosters(limit: int | None = None) -> int:
    """For every national team we know, pull the current squad from ESPN.

    This is what powers the club↔country web:
      * players get citizenship (country_id), DOB, position, photo
      * each international is linked to their CLUB via ESPN's defaultTeam id —
        clubs are resolved against our teams table (created if their league is
        one we track, or as league-less shells otherwise)
      * a changed club on an existing player is logged as a transfer movement
    """
    nats = [t for t in db.page_all("teams", "id,name,espn_id,country_id")
            if t.get("espn_id")]
    # is_national may be a string 'true' depending on client; select separately
    flags = {t["id"]: t.get("is_national") for t in
             db.page_all("teams", "id,is_national")}
    nats = [t for t in nats if flags.get(t["id"])]
    if limit:
        nats = nats[:limit]
    print(f"[rosters] {len(nats)} national teams")

    club_cache: dict[str, int | None] = {}   # espn club id -> team_id
    slug_to_league: dict[str, int] = {}
    for name, L in LEAGUES.items():
        if L.format == "league":
            slug_to_league[L.espn] = db.get_or_create_league(
                name=name, espn_slug=L.espn, understat_slug=L.understat,
                tier=L.tier, format=L.format)

    def resolve_club(club_espn_id: str | None, league_slug: str | None) -> int | None:
        if not club_espn_id:
            return None
        if club_espn_id in club_cache:
            return club_cache[club_espn_id]
        hits = db.select("teams", "id", espn_id=club_espn_id)
        if hits:
            club_cache[club_espn_id] = hits[0]["id"]
            return hits[0]["id"]
        core = espn.fetch_team_core(club_espn_id)
        if not core or not core.get("name"):
            club_cache[club_espn_id] = None
            return None
        tid = db.get_or_create_team(
            name=canonical_team(core["name"]) or core["name"],
            league_id=slug_to_league.get(league_slug or ""),
            espn_id=core["espn_id"], short_name=core.get("short_name"),
            league_format="league", crest_url=core.get("crest_url"),
        )
        club_cache[club_espn_id] = tid
        return tid

    written = 0
    for nt in nats:
        roster = []
        for slug in _ROSTER_SLUGS:
            roster = espn.fetch_roster(slug, nt["espn_id"])
            if roster:
                break
        if not roster:
            continue
        country_id = nt.get("country_id") or db.get_or_create_country(nt["name"])
        for a in roster:
            club_id = resolve_club(a.get("club_espn_id"), a.get("club_league_slug"))
            db.get_or_create_player(
                name=a["name"], team_id=club_id, country_id=country_id,
                position=a.get("position"), dob=a.get("dob"),
                photo_url=a.get("photo_url"),
            )
            written += 1
        print(f"[rosters] {nt['name']}: {len(roster)} players")
    print(f"[rosters] done: {written} squad slots")
    return written


# -------------------------- season backfill --------------------------

def backfill_seasons() -> int:
    """Stamp matches.season for historical rows (one-time after migration 002)."""
    if not db.has_backbone():
        print("[seasons] migration 002 not applied — nothing to do")
        return 0
    leagues = {l["id"]: l for l in db.page_all("leagues", "id,name,format")}
    styles = {name: L.season_style for name, L in LEAGUES.items()}
    n = 0
    for m in db.page_all("matches", "id,league_id,kickoff_utc,season"):
        if m.get("season"):
            continue
        L = leagues.get(m["league_id"], {})
        label = season_label(L.get("format"), styles.get(L.get("name"), "cross"),
                             None, m.get("kickoff_utc"))
        if label:
            db.client().table("matches").update({"season": label}).eq("id", m["id"]).execute()
            n += 1
    print(f"[seasons] stamped {n} matches")
    return n


# -------------------------- follows seed --------------------------

def seed_follows() -> None:
    from data.seed_countries import seed_countries
    from data.seed_follows import seed
    seed_countries()
    seed()


def _live_window_active(hours: float = 3.0) -> bool:
    """Cheap matchday guard for the 15-minute cron: True when any match is
    currently live or kicks off within ±hours of now."""
    now = datetime.now(timezone.utc)
    lo = (now - timedelta(hours=hours)).isoformat()
    hi = (now + timedelta(hours=hours)).isoformat()
    c = db.client()
    live = c.table("matches").select("id").eq("status", "live").limit(1).execute()
    if getattr(live, "data", None):
        return True
    near = (c.table("matches").select("id")
            .gte("kickoff_utc", lo).lte("kickoff_utc", hi).limit(1).execute())
    return bool(getattr(near, "data", None))


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
            if not _live_window_active():
                print("[pipeline] live: no live matches or kickoffs within ±3h — skipping")
                return 0
            ingest_espn(days_back=1, days_fwd=1)
            # refresh in-game lowdowns (regenerates only when score/period moved;
            # skips gracefully when ANTHROPIC_API_KEY isn't set)
            from data import lowdown
            lowdown.run(states=("live",))
        elif mode == "backfill":
            seasons = [s.strip() for s in (os.environ.get("PIPELINE_BACKFILL_SEASONS")
                       or "2223,2324,2425,2526").split(",") if s.strip()]
            print(f"[pipeline] backfill seasons: {seasons}")
            ingest_understat(seasons)
        elif mode == "seed":
            seed_follows()
        elif mode == "players":
            seasons = [s.strip() for s in (os.environ.get("PIPELINE_PLAYER_SEASONS")
                       or _current_understat_season()).split(",") if s.strip()]
            n = ingest_player_stats(seasons)
            print(f"[pipeline] players done: {n} player-match rows")
        elif mode == "rosters":
            n = ingest_rosters()
            print(f"[pipeline] rosters done: {n} squad slots")
        elif mode == "seasons":
            backfill_seasons()
        elif mode == "model":
            from data.model.pipeline import run as run_model
            run_model()
        elif mode == "lowdown":
            from data import lowdown
            lowdown.run()
        elif mode == "backtest":
            from data.model import backtest
            res = backtest.run()
            if not (res.get("beats_rps") and res.get("beats_log_loss")):
                print("[pipeline] BACKTEST GATE FAILED — xG model does not beat "
                      "the baseline on both RPS and log-loss")
                return 1
            print("[pipeline] backtest gate passed")
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

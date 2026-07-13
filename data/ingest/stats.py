"""
xG + shot depth — FBref / Understat via the `soccerdata` library.
This is what makes footy-mp's model better than WC26: real expected goals
per team per match, and player-level xG/xA, instead of goal/FIFA proxies.

`soccerdata` handles caching + polite rate limiting, so we never hand-scrape
or hammer a site. Install: `pip install soccerdata pandas`.

Understat covers the big-5 European leagues cleanly (best xG source).
FBref covers far more competitions + player match stats.

Outputs rows shaped for the Supabase `team_match_stats` / `player_match_stats` tables.
"""
from __future__ import annotations

# Understat league codes used by soccerdata
UNDERSTAT_LEAGUES = {
    "Premier League": "ENG-Premier League",
    "La Liga": "ESP-La Liga",
    "Serie A": "ITA-Serie A",
    "Bundesliga": "GER-Bundesliga",
    "Ligue 1": "FRA-Ligue 1",
}


def understat_team_xg(leagues=None, seasons=("2526",)):
    """
    Per-team, per-match xG from Understat.
    Returns list of dicts: {date, home, away, home_xg, away_xg, home_goals, away_goals, league}
    ready to join with ESPN matches and feed model/engine.fit_ratings().
    """
    import soccerdata as sd  # lazy import so the module loads without the dep
    leagues = list((leagues or UNDERSTAT_LEAGUES).values())
    us = sd.Understat(leagues=leagues, seasons=list(seasons))
    sched = us.read_schedule().reset_index()
    rows = []
    for _, r in sched.iterrows():
        rows.append({
            "date": str(r.get("date"))[:10],
            "league": r.get("league"),
            "home": r.get("home_team"),
            "away": r.get("away_team"),
            "home_xg": _num(r.get("home_xg")),
            "away_xg": _num(r.get("away_xg")),
            "home_goals": _num(r.get("home_goals")),
            "away_goals": _num(r.get("away_goals")),
            "neutral": False,
        })
    return rows


def understat_player_match(leagues=None, seasons=("2526",)):
    """Per-player, per-match stats from Understat: minutes, goals, assists, shots,
    xG, xA, key passes, cards, position. One cached request per match, so the first
    pull of a league-season takes a few minutes and daily increments are cheap.
    Returns flat dicts keyed for `player_match_stats`."""
    import soccerdata as sd
    leagues = list((leagues or UNDERSTAT_LEAGUES).values())
    us = sd.Understat(leagues=leagues, seasons=list(seasons))
    sched = us.read_schedule().reset_index()
    if "game_id" not in sched.columns:
        return []
    ids = [int(g) for g in sched["game_id"].dropna().unique().tolist()]
    if not ids:
        return []
    df = us.read_player_match_stats(match_id=ids).reset_index()
    rows = []
    for _, r in df.iterrows():
        rows.append({
            "date": str(r.get("game"))[:10],  # 'game' = "YYYY-MM-DD Home-Away"
            "league": r.get("league"),
            "team": r.get("team"),
            "player": r.get("player"),
            "understat_id": r.get("player_id"),
            "position": r.get("position"),
            "minutes": r.get("minutes"),
            "goals": r.get("goals"),
            "assists": r.get("assists"),
            "shots": r.get("shots"),
            "xg": r.get("xg"),
            "xa": r.get("xa"),
            "key_passes": r.get("key_passes"),
            "yellow": r.get("yellow_cards"),
            "red": r.get("red_cards"),
        })
    return rows


def fbref_player_match(leagues=None, seasons=("2526",)):
    """Player-level match stats (xG, xA, npxG, minutes) from FBref for availability
    modeling and player pages. Returns flat dicts:
    {date, league, team, player, minutes, goals, assists, xg, xa, npxg, shots, sot}

    FBref fetches one page per match (politely rate-limited by soccerdata), so a
    full league-season takes tens of minutes uncached. soccerdata caches to disk,
    making incremental daily runs cheap.
    """
    import soccerdata as sd
    leagues = list((leagues or UNDERSTAT_LEAGUES).values())
    fb = sd.FBref(leagues=leagues, seasons=list(seasons))
    df = fb.read_player_match_stats(stat_type="summary").reset_index()

    # soccerdata returns MultiIndex stat columns, e.g. ('Performance', 'Gls').
    # Flatten to snake_case so the mapping below survives library changes.
    def _flat(c):
        if isinstance(c, tuple):
            parts = [str(x).strip().lower() for x in c
                     if str(x).strip() and not str(x).startswith("Unnamed")]
            return "_".join(parts)
        return str(c).strip().lower()
    df.columns = [_flat(c) for c in df.columns]

    def _pick(*cands):
        for c in cands:
            if c in df.columns:
                return c
        return None

    cols = {
        "date":    _pick("date"),
        "game":    _pick("game"),
        "league":  _pick("league"),
        "team":    _pick("team"),
        "player":  _pick("player"),
        "minutes": _pick("min", "minutes", "performance_min"),
        "goals":   _pick("performance_gls", "gls", "goals"),
        "assists": _pick("performance_ast", "ast", "assists"),
        "xg":      _pick("expected_xg", "xg"),
        "xa":      _pick("expected_xag", "xag", "xg_assist", "xa"),
        "npxg":    _pick("expected_npxg", "npxg"),
        "shots":   _pick("performance_sh", "sh", "shots"),
        "sot":     _pick("performance_sot", "sot", "shots_on_target"),
    }
    rows = []
    for _, r in df.iterrows():
        d = {k: (r[v] if v is not None else None) for k, v in cols.items()}
        # 'game' looks like "2025-08-16 Home-Away"; use it when 'date' is absent
        if d.get("date") is None and d.get("game") is not None:
            d["date"] = str(d["game"])[:10]
        d["date"] = str(d["date"])[:10] if d.get("date") is not None else None
        d.pop("game", None)
        rows.append(d)
    return rows


def _num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


if __name__ == "__main__":
    # Dry description (no network unless soccerdata installed):
    print("Understat leagues available:", list(UNDERSTAT_LEAGUES))
    print("Run understat_team_xg() with soccerdata installed to pull real xG.")

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


def fbref_player_match(leagues=None, seasons=("2526",)):
    """Player-level match stats (xG, xA, npxG, minutes) from FBref for availability modeling."""
    import soccerdata as sd
    leagues = list((leagues or UNDERSTAT_LEAGUES).values())
    fb = sd.FBref(leagues=leagues, seasons=list(seasons))
    df = fb.read_player_match_stats(stat_type="summary").reset_index()
    keep = ["date", "league", "team", "player", "min", "goals", "assists",
            "xg", "xg_assist", "npxg", "shots", "shots_on_target"]
    cols = [c for c in keep if c in df.columns]
    return df[cols].to_dict("records")


def _num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


if __name__ == "__main__":
    # Dry description (no network unless soccerdata installed):
    print("Understat leagues available:", list(UNDERSTAT_LEAGUES))
    print("Run understat_team_xg() with soccerdata installed to pull real xG.")

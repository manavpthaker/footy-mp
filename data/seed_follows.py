"""
Seed the follows table for user 'mp'. Idempotent — safe to re-run.

Seed list (from CLAUDE_CODE_PROMPT):
  Players:  Luis Díaz, James Rodríguez, Juan Fernando Quintero, Richard Ríos, Jhon Lucumí
  Teams:    Colombia (NT), Bayern Munich, and each seeded player's club
  Leagues:  Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League
  Countries: Colombia

Player-team mappings reflect the 2025/26 season snapshot. Update as transfers happen.
"""
from __future__ import annotations

from data import db
from data.normalize import LEAGUE_SOURCES

# (name, club team name canonical, nationality country name, position)
SEED_PLAYERS = [
    ("Luis Díaz",              "Bayern Munich",         "Colombia", "FW"),
    ("James Rodríguez",        "Club León",             "Colombia", "MF"),
    ("Juan Fernando Quintero", "Atlético Nacional",     "Colombia", "MF"),
    ("Richard Ríos",           "Benfica",               "Colombia", "MF"),
    ("Jhon Lucumí",            "Bologna",               "Colombia", "DF"),
]

SEED_LEAGUES = [
    "Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Champions League",
]

SEED_COUNTRIES = [("Colombia", "COL", "CONMEBOL")]

# clubs listed in SEED_PLAYERS live in these leagues (best-effort; None => intl/other league)
CLUB_LEAGUE = {
    "Bayern Munich":      "Bundesliga",
    "Bologna":            "Serie A",
    # non-big-5: keep as own placeholder league so they still appear in the follow list
    "Club León":          "Liga MX",
    "Atlético Nacional":  "Categoría Primera A",
    "Benfica":            "Primeira Liga",
}


def _ensure_country(name: str, fifa: str | None = None, conf: str | None = None) -> int:
    return db.get_or_create_country(name, fifa_code=fifa, confederation=conf)


def _ensure_league(name: str, country_id: int | None = None, intl: bool = False) -> int:
    espn_slug, us_slug = LEAGUE_SOURCES.get(name, (None, None))
    return db.get_or_create_league(
        name=name, country_id=country_id, espn_slug=espn_slug,
        understat_slug=us_slug, is_international=intl,
    )


def seed() -> None:
    # countries
    country_ids = {}
    for n, fifa, conf in SEED_COUNTRIES:
        country_ids[n] = _ensure_country(n, fifa, conf)

    # leagues (big-5 + UCL)
    league_ids = {}
    for n in SEED_LEAGUES:
        intl = n in {"Champions League", "Europa League"}
        league_ids[n] = _ensure_league(n, intl=intl)

    # follows: leagues
    for n in SEED_LEAGUES:
        db.add_follow("league", league_ids[n])

    # follows: country
    db.add_follow("country", country_ids["Colombia"])

    # Colombia NT
    col_nt = db.get_or_create_team(
        name="Colombia", country_id=country_ids["Colombia"],
        is_national=True, short_name="COL",
    )
    db.add_follow("team", col_nt)

    # Bayern Munich (Bundesliga)
    bayern = db.get_or_create_team(
        name="Bayern Munich", league_id=league_ids["Bundesliga"],
    )
    db.add_follow("team", bayern)

    # each seeded player + their club team
    for pname, club, nat, pos in SEED_PLAYERS:
        nat_id = country_ids.get(nat) or _ensure_country(nat)
        # ensure the club's league exists (create ad-hoc leagues for non-big-5)
        club_league = CLUB_LEAGUE.get(club)
        if club_league:
            if club_league in league_ids:
                cl_id = league_ids[club_league]
            else:
                cl_id = _ensure_league(club_league)
        else:
            cl_id = None
        team_id = db.get_or_create_team(name=club, league_id=cl_id)
        db.add_follow("team", team_id)
        p_id = db.get_or_create_player(
            name=pname, team_id=team_id, country_id=nat_id, position=pos,
        )
        db.add_follow("player", p_id)

    print("[seed] follows seeded for user 'mp'")


if __name__ == "__main__":
    seed()

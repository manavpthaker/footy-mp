"""
One-off maintenance: merge duplicate team rows created when ESPN and Understat
spelled the same club differently (e.g. "Bournemouth" vs "AFC Bournemouth").

For each pair the Understat-created row (KEEP) carries the stats and the full
match history; the ESPN-created twin (DUPE) carries the real 2025-26 fixtures.
Merge = repoint everything at KEEP, rename KEEP to the ESPN display name (our
canonical convention), delete the twin, then collapse fixture-level duplicates
(placeholder row + ESPN row for the same game) onto the ESPN row.

Approved cleanup — deletes only redundant copies. Run once:
    python -m data.dedupe_teams
"""
from __future__ import annotations

from data import db

# (league, keep_name_now, dupe_name, final_name)
PAIRS = [
    ("Premier League", "Bournemouth",            "AFC Bournemouth",          "AFC Bournemouth"),
    ("La Liga",        "Alaves",                 "Alavés",                   "Alavés"),
    ("Serie A",        "Parma Calcio 1913",      "Parma",                    "Parma"),
    ("Bundesliga",     "Borussia M.Gladbach",    "Borussia Mönchengladbach", "Borussia Mönchengladbach"),
    ("Bundesliga",     "FC Heidenheim",          "1. FC Heidenheim 1846",    "1. FC Heidenheim 1846"),
    ("Bundesliga",     "Hamburger SV",           "Hamburg SV",               "Hamburg SV"),
    ("Bundesliga",     "RasenBallsport Leipzig", "RB Leipzig",               "RB Leipzig"),
    ("Ligue 1",        "Auxerre",                "AJ Auxerre",               "AJ Auxerre"),
    ("Ligue 1",        "Le Havre",               "Le Havre AC",              "Le Havre AC"),
    ("Ligue 1",        "Rennes",                 "Stade Rennais",            "Stade Rennais"),
]


def _team_id(c, league_id: int, name: str) -> int | None:
    r = c.table("teams").select("id").eq("league_id", league_id).eq("name", name).execute()
    rows = getattr(r, "data", None) or []
    return rows[0]["id"] if rows else None


def merge_pairs() -> None:
    c = db.client()
    leagues = {l["name"]: l["id"] for l in db.page_all("leagues", "id,name")}

    for league, keep_name, dupe_name, final_name in PAIRS:
        lid = leagues[league]
        keep = _team_id(c, lid, keep_name)
        dupe = _team_id(c, lid, dupe_name)
        if keep is None:
            # already renamed on a previous run — nothing to do for the rename
            keep = _team_id(c, lid, final_name)
        if keep is None or dupe is None or keep == dupe:
            print(f"[dedupe] {league}/{dupe_name}: nothing to merge (keep={keep}, dupe={dupe})")
            continue

        # carry the espn_id over, then repoint every reference dupe -> keep
        d = (getattr(c.table("teams").select("espn_id").eq("id", dupe).execute(), "data", None) or [{}])[0]
        if d.get("espn_id"):
            c.table("teams").update({"espn_id": d["espn_id"]}).eq("id", keep).execute()
        c.table("matches").update({"home_team_id": keep}).eq("home_team_id", dupe).execute()
        c.table("matches").update({"away_team_id": keep}).eq("away_team_id", dupe).execute()
        c.table("matches").update({"winner_team_id": keep}).eq("winner_team_id", dupe).execute()
        c.table("team_match_stats").update({"team_id": keep}).eq("team_id", dupe).execute()
        c.table("player_match_stats").update({"team_id": keep}).eq("team_id", dupe).execute()
        c.table("players").update({"team_id": keep}).eq("team_id", dupe).execute()
        c.table("follows").update({"entity_id": keep}).eq("entity_type", "team").eq("entity_id", dupe).execute()
        c.table("model_ratings").delete().eq("team_id", dupe).execute()
        c.table("teams").delete().eq("id", dupe).execute()
        c.table("teams").update({"name": final_name}).eq("id", keep).execute()
        print(f"[dedupe] {league}: {keep_name} + {dupe_name} -> {final_name} (id {keep})")


def collapse_fixture_duplicates() -> None:
    """After the team merge, the same fixture can exist twice: the Understat
    placeholder (has stats, fake 15:00Z kickoff, no espn_event_id) and the
    ESPN row (real kickoff + event id, no stats). Move stats onto the ESPN
    row and delete the placeholder. Also collapses exact placeholder
    duplicates (the old triplicated Serie A rows): keep the lowest id."""
    matches = db.page_all(
        "matches", "id,league_id,home_team_id,away_team_id,kickoff_utc,espn_event_id")
    c = db.client()

    by_fixture: dict[tuple, list[dict]] = {}
    for m in matches:
        day = (m.get("kickoff_utc") or "")[:10]
        by_fixture.setdefault((m["league_id"], m["home_team_id"], m["away_team_id"], day), []).append(m)

    # ±1 day tolerance: also group a placeholder with an ESPN row one day off
    def sibling_keys(key):
        from datetime import date, timedelta
        lid, h, a, day = key
        if not day:
            return []
        d = date.fromisoformat(day)
        return [(lid, h, a, str(d + timedelta(days=off))) for off in (-1, 1)]

    removed = moved = 0
    for key, group in list(by_fixture.items()):
        espn_rows = [m for m in group if m.get("espn_event_id")]
        ph_rows = [m for m in group if not m.get("espn_event_id")]
        if not espn_rows:
            for sk in sibling_keys(key):
                espn_rows += [m for m in by_fixture.get(sk, []) if m.get("espn_event_id")]
        if espn_rows and ph_rows:
            target = espn_rows[0]
            for ph in ph_rows:
                for s in db.page_all("team_match_stats", "match_id,team_id", match_id=ph["id"]):
                    c.table("team_match_stats").delete().eq("match_id", target["id"]).eq("team_id", s["team_id"]).execute()
                c.table("team_match_stats").update({"match_id": target["id"]}).eq("match_id", ph["id"]).execute()
                c.table("player_match_stats").update({"match_id": target["id"]}).eq("match_id", ph["id"]).execute()
                c.table("predictions").delete().eq("match_id", ph["id"]).execute()
                c.table("lowdowns").delete().eq("match_id", ph["id"]).execute()
                c.table("matches").delete().eq("id", ph["id"]).execute()
                removed += 1
                moved += 1
        elif len(ph_rows) > 1:
            keep = min(ph_rows, key=lambda m: m["id"])
            for ph in ph_rows:
                if ph["id"] == keep["id"]:
                    continue
                c.table("team_match_stats").delete().eq("match_id", ph["id"]).execute()
                c.table("player_match_stats").delete().eq("match_id", ph["id"]).execute()
                c.table("predictions").delete().eq("match_id", ph["id"]).execute()
                c.table("matches").delete().eq("id", ph["id"]).execute()
                removed += 1
    print(f"[dedupe] fixtures: {moved} stat-sets moved onto ESPN rows, {removed} duplicate rows deleted")


if __name__ == "__main__":
    merge_pairs()
    collapse_fixture_duplicates()
    print("[dedupe] done — re-run the model next: python -m data.pipeline model")

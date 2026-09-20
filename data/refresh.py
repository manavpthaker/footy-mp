"""Full published calendars and current club/national rosters, independent of xG."""
from __future__ import annotations
import json
import os
import re
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from data import db
from data.ingest import espn
from data.normalize import LEAGUES, canonical_team, _fold


def roster_match(athlete, candidates, team_id):
    """Never guess between namesakes; accent variants may match with compatible DOB."""
    valid = [p for p in candidates if not (p.get("dob") and athlete.get("dob") and p["dob"] != athlete["dob"])]
    dated = [p for p in valid if athlete.get("dob") and p.get("dob") == athlete["dob"]]
    if len(dated) == 1:
        return dated[0]
    if len(valid) == 1:
        return valid[0]
    exact = [p for p in valid if p.get("team_id") == team_id]
    return exact[0] if len(exact) == 1 else None


def refresh_rosters(report):
    from data.pipeline import _ensure_leagues
    ids = _ensure_leagues(list(LEAGUES))
    teams = db.page_all("teams")
    by_espn = {str(t["espn_id"]): t for t in teams if t.get("espn_id")}
    countries = db.page_all("countries")
    by_country = {_fold(c["name"]): c["id"] for c in countries}
    by_code = {c["fifa_code"]: c["id"] for c in countries if c.get("fifa_code")}
    def country(name, code=None):
        if code and code in by_code: return by_code[code]
        name = canonical_team(name)
        if not name: return None
        key = _fold(name)
        if key not in by_country: by_country[key] = db.get_or_create_country(name, fifa_code=code)
        return by_country[key]
    def ensure_team(t, league):
        eid = str(t["id"])
        national = bool(t.get("isNational")) or league.format in ("friendly", "qualifiers", "tournament")
        tid = db.get_or_create_team(name=canonical_team(t["displayName"]), espn_id=eid,
            league_id=ids[league.name], league_format=league.format,
            country_id=country(t["displayName"]) if national else None,
            crest_url=(t.get("logos") or [{}])[0].get("href"), is_national=national)
        by_espn[eid] = {"id": tid, "name": t["displayName"], "espn_id": eid,
            "country_id": country(t["displayName"]) if national else None, "is_national": national}
        return by_espn[eid]
    def catalogue(league):
        try:
            data = espn._get(f"{espn.BASE}/{league.espn}/teams?limit=1000")
            rows = [x["team"] for sport in data.get("sports", []) for l in sport.get("leagues", []) for x in l.get("teams", [])]
            return league, rows, None
        except Exception as error: return league, [], type(error).__name__
    jobs = {}
    domestic = [l for l in LEAGUES.values() if l.format == "league"]
    nat_leagues = [LEAGUES["Int. Friendlies"], LEAGUES["UEFA Nations League"], LEAGUES["World Cup"]]
    for league, rows, error in ThreadPoolExecutor(max_workers=4).map(catalogue, domestic + nat_leagues):
        if error:
            report["failures"].append(f"team catalogue {league.name}: {error}"); continue
        report["catalogues"][league.name] = len(rows)
        for t in rows:
            team = ensure_team(t, league)
            jobs.setdefault(team["espn_id"], (team, league.espn))
    # Also revisit national teams which are known but absent from this window's catalogue.
    for t in teams:
        if t.get("is_national") and t.get("espn_id") and not re.search(r"winner|loser|tbd|to be decided", t["name"], re.I):
            jobs.setdefault(str(t["espn_id"]), (t, "fifa.friendly"))
    def roster(job):
        team, slug = job
        try: return team, slug, espn.fetch_roster(slug, team["espn_id"], strict=True), None
        except Exception as error:
            unavailable = getattr(error.__cause__, "code", None) == 404
            return team, slug, [], "not-published" if unavailable else type(error).__name__
    # Fetch independently; resolve and write serially to avoid racing player identities.
    pulled = list(ThreadPoolExecutor(max_workers=4).map(roster, jobs.values()))
    existing = db.page_all("players")
    by_name = defaultdict(list)
    for p in existing: by_name[_fold(p["name"])].append(p)
    inserts, updates, claimed = [], {}, {}
    for team, slug, athletes, error in pulled:
        if error:
            if error == "not-published":
                report["unavailable_rosters"].append(team["name"]); continue
            report["failures"].append(f"roster {team['name']}: {error}"); continue
        report["rosters"][team["name"]] = len(athletes)
        if 0 < len(athletes) < 11:
            report["partial_rosters"].append(team["name"])
        if not athletes:
            report["unavailable_rosters"].append(team["name"]); continue
        for a in athletes:
            club_eid = a.get("club_espn_id")
            # Membership can lag a transfer. The player's default club wins;
            # a stale entry must not move them back to their former roster.
            if not team.get("is_national") and club_eid and club_eid != team["espn_id"]:
                report["stale_roster_entries"] += 1; continue
            club = team if not team.get("is_national") else by_espn.get(club_eid)
            if not club and club_eid:
                core = espn.fetch_team_core(club_eid)
                if core:
                    league = next((l for l in domestic if l.espn == a.get("club_league_slug")), None)
                    tid = db.get_or_create_team(name=canonical_team(core["name"]), espn_id=club_eid,
                        league_id=ids[league.name] if league else None, league_format="league", crest_url=core.get("crest_url"))
                    club = by_espn[club_eid] = {"id": tid, "name": core["name"]}
            tid = club["id"] if club else None
            cid = team.get("country_id") if team.get("is_national") else country(a.get("citizenship"), a.get("country_code"))
            candidates = by_name[_fold(a["name"])]
            p = roster_match(a, candidates, tid)
            distinct_birthdate = bool(a.get("dob")) and all(c.get("dob") and c["dob"] != a["dob"] for c in candidates)
            if candidates and not p and not distinct_birthdate:
                report["ambiguous_players"].append(a["name"]); continue
            if a.get("espn_id") in claimed:
                p = claimed[a["espn_id"]]
            if not p:
                p = {"name": a["name"], "team_id": tid, "country_id": cid,
                    "position": a.get("position"), "dob": a.get("dob"), "photo_url": a.get("photo_url")}
                inserts.append(p); by_name[_fold(a["name"])].append(p)
            else:
                patch = {}
                if tid and tid != p.get("team_id"): patch["team_id"] = tid
                # National roster evidence takes priority over a club's citizenship label.
                if cid and (team.get("is_national") or not p.get("country_id")): patch["country_id"] = cid
                for k in ("position", "dob", "photo_url"):
                    if a.get(k) and not p.get(k): patch[k] = a[k]
                if any(p.get(k) != v for k, v in patch.items()):
                    p.update(patch)
                    if p.get("id"): updates[p["id"]] = p
            if a.get("espn_id"): claimed[a["espn_id"]] = p
        print(f"[refresh] {team['name']}: {len(athletes)} roster entries", flush=True)
    for start in range(0, len(inserts), 150):
        db.client().table("players").insert(inserts[start:start+150]).execute()
    changed = list(updates.values())
    for p in changed:
        db.client().table("players").update({k: v for k, v in p.items() if k != "id"}).eq("id", p["id"]).execute()
    report.update(players_added=len(inserts), players_updated=len(updates), players_checked=len(claimed))


def refresh():
    from data.pipeline import ingest_espn
    now = datetime.now(timezone.utc)
    report = {"checked_at": now.isoformat(), "failures": [], "catalogues": {}, "rosters": {},
        "unavailable_rosters": [], "partial_rosters": [], "ambiguous_players": [], "stale_roster_entries": 0}
    names = list(LEAGUES)
    names.sort(key=lambda name: 0 if name == "MLS" else 1)
    if os.environ.get("PIPELINE_REFRESH_ROSTERS_ONLY") != "1":
        for name in names:
            try: ingest_espn(leagues=[name], dates=[str(now.year), str(now.year + 1)])
            except Exception as error: report["failures"].append(f"calendar {name}: {error}")
    try:
        refresh_rosters(report)
    except Exception as error:
        report["failures"].append(f"roster persistence: {type(error).__name__}")
    path = Path(os.environ.get("PIPELINE_REFRESH_REPORT", "/tmp/footy-refresh-report.json"))
    path.write_text(json.dumps(report, indent=2))
    print(f"[refresh] checked={report.get('players_checked', 0)} added={report.get('players_added', 0)} updated={report.get('players_updated', 0)} failures={len(report['failures'])}; report {path}")
    if report["failures"]: raise RuntimeError("Refresh incomplete; inspect report for failed sources")

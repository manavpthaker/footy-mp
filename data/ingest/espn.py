"""
ESPN ingestion — fixtures, results, live scores, penalty shootouts.
Ported and generalized from the WC26 sync. Free, no API key.

ESPN's public site API:
  scoreboard: https://site.api.espn.com/apis/site/v2/sports/soccer/{slug}/scoreboard?dates=YYYYMMDD
  summary:    https://site.api.espn.com/apis/site/v2/sports/soccer/{slug}/summary?event={id}

Returns normalized match dicts ready to upsert into Supabase `matches`.
Use requests in the GitHub Action; kept dependency-light here.
"""
from __future__ import annotations
import json
import urllib.request
from datetime import datetime, timezone

BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer"
CORE = "https://sports.core.api.espn.com/v2/sports/soccer"

# The authoritative league registry lives in data/normalize.py (LEAGUES).
# This module stays slug-agnostic: callers pass slugs in.


def _get(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "footy-mp/1.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode())


def fetch_day(slug: str, yyyymmdd: str) -> list[dict]:
    """All matches for a league on a date. Normalized."""
    url = f"{BASE}/{slug}/scoreboard?dates={yyyymmdd}"
    try:
        data = _get(url)
    except Exception as e:
        print(f"[espn] {slug} {yyyymmdd} error: {e}")
        return []
    out = []
    for ev in data.get("events", []):
        comp = ev["competitions"][0]
        cs = comp.get("competitors", [])
        if len(cs) != 2:
            continue
        home = next((c for c in cs if c.get("homeAway") == "home"), cs[0])
        away = next((c for c in cs if c.get("homeAway") == "away"), cs[1])
        st = comp.get("status", {}).get("type", {})
        state = st.get("state")  # pre / in / post
        season = ev.get("season") or {}
        so_h = home.get("shootoutScore")
        so_a = away.get("shootoutScore")
        went_pens = so_h is not None and so_a is not None
        detail = (st.get("detail") or "").upper()
        went_et = went_pens or "AET" in detail or "EXTRA" in detail
        winner_home = home.get("winner")
        winner_away = away.get("winner")
        out.append({
            "espn_event_id": ev.get("id"),
            "league_slug": slug,
            "home": home["team"].get("displayName"),
            "away": away["team"].get("displayName"),
            "home_espn_id": home["team"].get("id"),
            "away_espn_id": away["team"].get("id"),
            "home_logo": home["team"].get("logo"),
            "away_logo": away["team"].get("logo"),
            "kickoff_utc": ev.get("date"),
            "status": {"pre": "scheduled", "in": "live", "post": "final"}.get(state, "scheduled"),
            "minute": _minute(comp),
            "home_goals": _int(home.get("score")),
            "away_goals": _int(away.get("score")),
            "went_et": went_et,
            "went_pens": went_pens,
            "pens_home": _int(so_h) if went_pens else None,
            "pens_away": _int(so_a) if went_pens else None,
            "winner": home["team"].get("displayName") if winner_home
                      else away["team"].get("displayName") if winner_away else None,
            "detail": st.get("detail"),
            # phase: ESPN's season.slug — 'group-stage', 'semifinals', 'final',
            # 'league-phase', or a season label for domestic leagues
            "phase": season.get("slug"),
            "season_year": season.get("year"),
        })
    return out


# ---------------- rosters (national-team squads -> the club/country web) ----------------

_POS_MAP = {"G": "GK", "D": "DF", "M": "MF", "F": "FW", "A": "FW"}


def _ref_id(obj) -> str | None:
    """Pull the trailing id out of a core-API $ref like .../teams/103?lang=en."""
    ref = (obj or {}).get("$ref") or ""
    tail = ref.split("?")[0].rstrip("/").rsplit("/", 1)[-1]
    return tail or None


def fetch_roster(slug: str, team_espn_id: str) -> list[dict]:
    """Current squad for a (national) team under a competition slug.
    Gives citizenship + date of birth + the player's CLUB (defaultTeam) — the
    raw material for the club↔country web."""
    url = f"{BASE}/{slug}/teams/{team_espn_id}/roster"
    try:
        data = _get(url)
    except Exception as e:
        print(f"[espn] roster {slug}/{team_espn_id} error: {e}")
        return []
    out = []
    for a in data.get("athletes", []):
        pos = ((a.get("position") or {}).get("abbreviation") or "")[:1]
        headshot = a.get("headshot")
        out.append({
            "name": a.get("displayName") or a.get("fullName"),
            "position": _POS_MAP.get(pos),
            "jersey": a.get("jersey"),
            "dob": (a.get("dateOfBirth") or "")[:10] or None,
            "citizenship": a.get("citizenship"),
            "club_espn_id": _ref_id(a.get("defaultTeam")),
            "club_league_slug": _ref_id(a.get("defaultLeague")),
            "photo_url": (headshot or {}).get("href") if isinstance(headshot, dict) else None,
        })
    return [r for r in out if r["name"]]


def fetch_team_core(team_espn_id: str) -> dict | None:
    """Resolve a bare team id (from a roster's defaultTeam $ref) to its name."""
    try:
        data = _get(f"{CORE}/teams/{team_espn_id}")
    except Exception as e:
        print(f"[espn] core team {team_espn_id} error: {e}")
        return None
    logos = data.get("logos") or []
    return {
        "espn_id": str(data.get("id") or team_espn_id),
        "name": data.get("displayName") or data.get("name"),
        "short_name": data.get("shortDisplayName") or data.get("abbreviation"),
        "crest_url": (logos[0].get("href") if logos and isinstance(logos[0], dict)
                      else None),
    }


def fetch_summary(slug: str, event_id: str) -> dict:
    """Play-by-play + team stats for one match (cards, subs, possession, shots).
    ESPN has no true xG — xG comes from the FBref/Understat client (stats.py)."""
    url = f"{BASE}/{slug}/summary?event={event_id}"
    data = _get(url)
    out = {"event_id": event_id, "key_events": [], "team_stats": {}}
    for e in data.get("keyEvents", []):
        out["key_events"].append({
            "minute": (e.get("clock") or {}).get("displayValue"),
            "type": (e.get("type") or {}).get("text"),
            "team": (e.get("team") or {}).get("displayName"),
            "who": "/".join(p.get("athlete", {}).get("displayName", "")
                            for p in e.get("participants", [])),
            "text": e.get("text"),
        })
    for tb in (data.get("boxscore", {}) or {}).get("teams", []):
        nm = tb["team"].get("displayName")
        stats = {s.get("name"): s.get("displayValue") for s in tb.get("statistics", [])}
        out["team_stats"][nm] = stats
    return out


def _int(v):
    try:
        return int(v)
    except (TypeError, ValueError):
        return None


def _minute(comp):
    try:
        return int(float((comp.get("status") or {}).get("clock") or 0) / 60)
    except Exception:
        return None


def today_yyyymmdd() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d")


if __name__ == "__main__":
    # smoke: pull a recent WC date we know has data
    for m in fetch_day("fifa.world", "20260703")[:5]:
        print(m["home"], m.get("home_goals"), "v", m.get("away_goals"), m["away"],
              "|", m["status"], "| pens", m.get("pens_home"), m.get("pens_away"))

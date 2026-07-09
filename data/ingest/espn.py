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

# leagues we cover (extend freely). key = our label, value = ESPN slug.
LEAGUES = {
    "Premier League": "eng.1", "La Liga": "esp.1", "Serie A": "ita.1",
    "Bundesliga": "ger.1", "Ligue 1": "fra.1", "Champions League": "uefa.champions",
    "Europa League": "uefa.europa", "World Cup": "fifa.world",
    "Euros": "uefa.euro", "Copa America": "conmebol.america",
}


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
        so_h = home.get("shootoutScore")
        so_a = away.get("shootoutScore")
        went_pens = so_h is not None and so_a is not None
        winner_home = home.get("winner")
        winner_away = away.get("winner")
        out.append({
            "espn_event_id": ev.get("id"),
            "league_slug": slug,
            "home": home["team"].get("displayName"),
            "away": away["team"].get("displayName"),
            "home_espn_id": home["team"].get("id"),
            "away_espn_id": away["team"].get("id"),
            "kickoff_utc": ev.get("date"),
            "status": {"pre": "scheduled", "in": "live", "post": "final"}.get(state, "scheduled"),
            "minute": _minute(comp),
            "home_goals": _int(home.get("score")),
            "away_goals": _int(away.get("score")),
            "went_pens": went_pens,
            "pens_home": _int(so_h) if went_pens else None,
            "pens_away": _int(so_a) if went_pens else None,
            "winner": home["team"].get("displayName") if winner_home
                      else away["team"].get("displayName") if winner_away else None,
            "detail": st.get("detail"),
        })
    return out


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

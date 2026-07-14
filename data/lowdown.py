"""
The Lowdown — LLM-written match commentary, ported from the WC26 visualizer
and rebuilt on real data.

The WC26 lowdown was template-driven (seeded phrase banks over factor bars).
This version keeps its voice — "a blend of a sharp studio host, a tactical
ex-pro, and a swaggering striker" — but feeds a multi-agent pipeline with the
full footy-mp dataset: model ratings + predictions, per-match xG, player-level
form, momentum trends, head-to-head, and knockout context.

Flow per match:
  1. build_dossier()  — pure data pull from Supabase, no LLM.
  2. analyst agents   — four focused passes (each team, players/matchups,
                        momentum/stakes) that turn numbers into insights.
  3. synthesizer      — writes 3-4 paragraphs + a bold verdict in the WC26
                        voice, grounded ONLY in the dossier + analyst notes.
  4. upsert into `lowdowns` keyed on (match_id, version); an inputs hash
                        skips regeneration when nothing changed.

Requires ANTHROPIC_API_KEY. Runs via `python -m data.pipeline lowdown`.
"""
from __future__ import annotations

import hashlib
import json
import os
from datetime import datetime, timedelta, timezone

from data import db

LOWDOWN_VERSION = "lowdown-v1"
GEN_MODEL = "claude-opus-4-8"
MODEL_VERSION = "footy-mp-v2"  # which predictions/ratings feed the dossier


# ------------------------------ dossier ------------------------------

def _season_start_iso() -> str:
    now = datetime.now(timezone.utc)
    y = now.year if now.month >= 8 else now.year - 1
    return f"{y}-08-01T00:00:00Z"


def _team_season_xg(team_id: int, matches_by_id: dict, stats: list[dict]) -> dict:
    """Season xG for/against per match for a team, plus last-5 trend."""
    rows = []
    for s in stats:
        if s["team_id"] != team_id:
            continue
        m = matches_by_id.get(s["match_id"])
        if not m:
            continue
        rows.append({
            "date": (m.get("kickoff_utc") or "")[:10],
            "xg": float(s["xg"]) if s.get("xg") is not None else None,
            "xga": float(s["xga"]) if s.get("xga") is not None else None,
        })
    rows = [r for r in rows if r["xg"] is not None and r["xga"] is not None]
    rows.sort(key=lambda r: r["date"])
    if not rows:
        return {}
    n = len(rows)
    season = {
        "matches_with_xg": n,
        "xg_per_match": round(sum(r["xg"] for r in rows) / n, 2),
        "xga_per_match": round(sum(r["xga"] for r in rows) / n, 2),
    }
    last5 = rows[-5:]
    season["last5_xg_per_match"] = round(sum(r["xg"] for r in last5) / len(last5), 2)
    season["last5_xga_per_match"] = round(sum(r["xga"] for r in last5) / len(last5), 2)
    # momentum: last-5 xG difference vs season xG difference
    season["momentum"] = round(
        (season["last5_xg_per_match"] - season["last5_xga_per_match"])
        - (season["xg_per_match"] - season["xga_per_match"]), 2)
    return season


def _team_form(team_id: int, team_name: dict, matches: list[dict], limit: int = 5) -> list[dict]:
    """Last N finished matches for a team, newest last."""
    mine = [m for m in matches
            if m["status"] == "final" and team_id in (m["home_team_id"], m["away_team_id"])
            and m.get("home_goals") is not None]
    mine.sort(key=lambda m: m.get("kickoff_utc") or "")
    out = []
    for m in mine[-limit:]:
        home = m["home_team_id"] == team_id
        gf = m["home_goals"] if home else m["away_goals"]
        ga = m["away_goals"] if home else m["home_goals"]
        res = "W" if gf > ga else "L" if gf < ga else "D"
        if m.get("went_pens") and m.get("pens_home") is not None:
            won_pens = (m["pens_home"] > m["pens_away"]) == home
            res = f"{res} ({'won' if won_pens else 'lost'} on pens)"
        out.append({
            "date": (m.get("kickoff_utc") or "")[:10],
            "opponent": team_name.get(m["away_team_id" if home else "home_team_id"], "?"),
            "home": home, "score": f"{gf}-{ga}", "result": res,
        })
    return out


def _key_players(team_id: int, season_start: str, matches_by_id: dict, top: int = 3) -> list[dict]:
    rows = db.page_all("player_match_stats", "*", team_id=team_id)
    if not rows:
        return []
    players = {p["id"]: p["name"] for p in db.page_all("players", "id,name", team_id=team_id)}
    agg: dict[int, dict] = {}
    for r in rows:
        m = matches_by_id.get(r["match_id"])
        if not m or (m.get("kickoff_utc") or "") < season_start:
            continue
        a = agg.setdefault(r["player_id"], {
            "goals": 0, "assists": 0, "xg": 0.0, "xa": 0.0, "minutes": 0,
            "recent": []})
        a["goals"] += r.get("goals") or 0
        a["assists"] += r.get("assists") or 0
        a["xg"] += float(r.get("xg") or 0)
        a["xa"] += float(r.get("xa") or 0)
        a["minutes"] += r.get("minutes") or 0
        a["recent"].append(((m.get("kickoff_utc") or "")[:10],
                            (r.get("goals") or 0) + (r.get("assists") or 0)))
    out = []
    for pid, a in agg.items():
        if a["minutes"] < 450:
            continue
        a["recent"].sort()
        last3_ga = sum(g for _, g in a["recent"][-3:])
        out.append({
            "name": players.get(pid, "?"),
            "goals": a["goals"], "assists": a["assists"],
            "xg": round(a["xg"], 1), "xa": round(a["xa"], 1),
            "minutes": a["minutes"], "last3_goal_involvements": last3_ga,
        })
    out.sort(key=lambda p: p["goals"] + p["assists"] + 0.5 * p["xg"], reverse=True)
    return out[:top]


def build_dossier(match: dict, teams: dict, leagues: dict,
                  all_matches: list[dict], all_stats: list[dict],
                  ratings: dict, predictions: dict) -> dict:
    """Everything the agents may cite, in one JSON-safe dict. No LLM here."""
    hid, aid = match["home_team_id"], match["away_team_id"]
    team_name = {t["id"]: t["name"] for t in teams.values()}
    league = leagues.get(match.get("league_id"), {})
    matches_by_id = {m["id"]: m for m in all_matches}
    season_start = _season_start_iso()

    h2h = [m for m in all_matches
           if m["status"] == "final" and m.get("home_goals") is not None
           and {m["home_team_id"], m["away_team_id"]} == {hid, aid}]
    h2h.sort(key=lambda m: m.get("kickoff_utc") or "")

    def rating_line(tid):
        r = ratings.get(tid)
        if not r:
            return None
        return {"attack": float(r["attack"]), "defense": float(r["defense"]),
                "overall": float(r["overall"]),
                "temper": float(r["temper"]) if r.get("temper") is not None else 0.0}

    pred = predictions.get(match["id"])
    dossier = {
        "fixture": {
            "home": team_name.get(hid), "away": team_name.get(aid),
            "kickoff_utc": match.get("kickoff_utc"),
            "competition": league.get("name"),
            "is_international": bool(league.get("is_international")),
            "status": match.get("status"),
        },
        "model": {
            "version": MODEL_VERSION,
            "prediction": {
                "p_home": float(pred["p_home"]), "p_draw": float(pred["p_draw"]),
                "p_away": float(pred["p_away"]),
                "expected_goals": {"home": float(pred["home_xg"]), "away": float(pred["away_xg"])},
                "p_advance_home": float(pred["p_advance_home"]) if pred.get("p_advance_home") is not None else None,
                "p_extra_time_or_pens": float(pred["p_et"]) if pred.get("p_et") is not None else None,
                "p_pens": float(pred["p_pens"]) if pred.get("p_pens") is not None else None,
            } if pred else None,
            "ratings": {"home": rating_line(hid), "away": rating_line(aid)},
        },
        "form": {
            "home_last5": _team_form(hid, team_name, all_matches),
            "away_last5": _team_form(aid, team_name, all_matches),
        },
        "season_xg": {
            "home": _team_season_xg(hid, matches_by_id, all_stats),
            "away": _team_season_xg(aid, matches_by_id, all_stats),
        },
        "key_players": {
            "home": _key_players(hid, season_start, matches_by_id),
            "away": _key_players(aid, season_start, matches_by_id),
        },
        "head_to_head": [{
            "date": (m.get("kickoff_utc") or "")[:10],
            "home": team_name.get(m["home_team_id"]), "away": team_name.get(m["away_team_id"]),
            "score": f"{m['home_goals']}-{m['away_goals']}",
            "pens": f"{m['pens_home']}-{m['pens_away']}" if m.get("went_pens") else None,
        } for m in h2h[-5:]],
    }
    return dossier


def dossier_hash(dossier: dict) -> str:
    return hashlib.md5(json.dumps(dossier, sort_keys=True).encode()).hexdigest()


# ------------------------------ agents ------------------------------

VOICE = """You write "The Lowdown" — match commentary in a very specific voice:
a blend of a sharp studio host, a tactical ex-pro, and a swaggering striker.
Confident, funny, direct. Numbers worn lightly, never dumped. Short sentences
land like jabs. You call a favorite a favorite ("Write it in pen") and a
coin flip a coin flip ("Anybody handing you a 'lock' here is selling
something"). You never hedge everything into mush, and you never invent a
fact that isn't in the data you're given."""

ANALYST_SYSTEM = """You are a football analyst preparing notes for a match
commentary writer. You are given a data dossier. Extract only insights that
the data actually supports — numbers, trends, mismatches, streaks. Be
specific and quantitative. 4-6 bullet points, each one sentence. No filler,
no hedging, no invented facts. If the data for something is missing, skip it
rather than guessing."""

SYNTH_SYSTEM = VOICE + """

You are given the match dossier (the source of truth for every number) and
notes from four analysts. Write the lowdown:

- 3 or 4 paragraphs, each 2-4 sentences.
- Paragraph 1: the setup — what this match is, both teams' form/state.
- Paragraph 2: the matchup — tactics, key players, where it's won and lost.
- Paragraph 3: the verdict paragraph — lead with the call, back it with the
  model's numbers (win probabilities, expected goals), state the predicted
  angle plainly. Confidence must match the probability gap: >=25 points of
  win-probability gap means call it flat out; 14-24 means "should handle
  this"; under 8 means say it's a genuine coin flip.
- Optional paragraph 4: stakes — knockout math (extra time/pens probability,
  shootout nerve), or what the result means. Include when relevant.
- Also produce "verdict": ONE punchy sentence with the call and most likely
  scoreline (derive a plausible scoreline from the expected goals; round
  sensibly). This appears in bold above the paragraphs.

Hard rules: every number must come from the dossier. Never fabricate stats,
injuries, quotes, or history. If player data is missing for a team, talk
about the team, not imaginary players. Write for a reader who sees this next
to the probability bars — do not re-list every probability, weave in the two
or three that matter."""


def _client():
    import anthropic
    return anthropic.Anthropic()


def _ask(client, system: str, user: str, max_tokens: int = 1200) -> str:
    resp = client.messages.create(
        model=GEN_MODEL,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    if resp.stop_reason == "refusal":
        return ""
    return next((b.text for b in resp.content if b.type == "text"), "")


LOWDOWN_SCHEMA = {
    "type": "object",
    "properties": {
        "verdict": {"type": "string"},
        "paragraphs": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["verdict", "paragraphs"],
    "additionalProperties": False,
}


def generate_lowdown(dossier: dict) -> dict | None:
    """Run the analyst agents + synthesizer for one match dossier."""
    client = _client()
    d = json.dumps(dossier, indent=1)
    home = dossier["fixture"]["home"]
    away = dossier["fixture"]["away"]

    analysts = {
        "home_team": f"Analyze {home} (the home side) only: their model ratings, "
                     f"season xG profile, and recent form.\n\nDossier:\n{d}",
        "away_team": f"Analyze {away} (the away side) only: their model ratings, "
                     f"season xG profile, and recent form.\n\nDossier:\n{d}",
        "players":   f"Analyze the player matchup for {home} vs {away}: key players, "
                     f"hot/cold streaks (last-3 goal involvements vs season rate), and "
                     f"who decides this game.\n\nDossier:\n{d}",
        "momentum":  f"Analyze momentum and stakes for {home} vs {away}: form trends "
                     f"(last-5 xG vs season xG), head-to-head, knockout context "
                     f"(extra-time/pens probabilities, temper ratings) if present."
                     f"\n\nDossier:\n{d}",
    }
    notes = {}
    for key, prompt in analysts.items():
        notes[key] = _ask(client, ANALYST_SYSTEM, prompt)

    synth_prompt = (
        f"Match: {home} vs {away} ({dossier['fixture'].get('competition')})\n\n"
        f"DOSSIER (source of truth):\n{d}\n\n"
        f"ANALYST NOTES:\n"
        f"[{home}]\n{notes['home_team']}\n\n"
        f"[{away}]\n{notes['away_team']}\n\n"
        f"[players]\n{notes['players']}\n\n"
        f"[momentum & stakes]\n{notes['momentum']}\n\n"
        f"Write the lowdown now."
    )
    resp = client.messages.create(
        model=GEN_MODEL,
        max_tokens=2000,
        system=SYNTH_SYSTEM,
        output_config={"format": {"type": "json_schema", "schema": LOWDOWN_SCHEMA}},
        messages=[{"role": "user", "content": synth_prompt}],
    )
    if resp.stop_reason == "refusal":
        return None
    text = next((b.text for b in resp.content if b.type == "text"), "")
    try:
        out = json.loads(text)
    except json.JSONDecodeError:
        return None
    if not out.get("paragraphs"):
        return None
    return out


# ------------------------------ runner ------------------------------

def _load_context():
    """One batch of Supabase reads shared across all matches this run."""
    teams = {t["id"]: t for t in db.page_all("teams", "id,name")}
    leagues = {l["id"]: l for l in db.page_all("leagues", "id,name,is_international")}
    all_matches = db.page_all(
        "matches",
        "id,league_id,home_team_id,away_team_id,kickoff_utc,status,"
        "home_goals,away_goals,went_pens,pens_home,pens_away")
    all_stats = db.page_all("team_match_stats", "match_id,team_id,xg,xga")

    ratings = {}
    for r in db.page_all("model_ratings", "*", model_version=MODEL_VERSION):
        cur = ratings.get(r["team_id"])
        if cur is None or r["as_of_date"] > cur["as_of_date"]:
            ratings[r["team_id"]] = r

    predictions = {p["match_id"]: p for p in
                   db.page_all("predictions", "*", model_version=MODEL_VERSION)}
    return teams, leagues, all_matches, all_stats, ratings, predictions


def run(days_ahead: int = 7, limit: int | None = None) -> dict:
    """Generate lowdowns for upcoming matches that have a prediction."""
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("[lowdown] ANTHROPIC_API_KEY not set — skipping (not an error)")
        return {"status": "skipped_no_key"}

    limit = limit or int(os.environ.get("PIPELINE_LOWDOWN_LIMIT") or 12)
    teams, leagues, all_matches, all_stats, ratings, predictions = _load_context()

    now = datetime.now(timezone.utc)
    horizon = (now + timedelta(days=days_ahead)).isoformat()
    upcoming = [m for m in all_matches
                if m["status"] in ("scheduled", "live")
                and m["id"] in predictions
                and (m.get("kickoff_utc") or "") <= horizon
                and (m.get("kickoff_utc") or "") >= (now - timedelta(hours=6)).isoformat()]
    # placeholder teams ("Semifinal 1 Winner") make useless lowdowns — skip them
    def real_teams(m):
        hn = teams.get(m["home_team_id"], {}).get("name", "")
        an = teams.get(m["away_team_id"], {}).get("name", "")
        return not any(w in (hn + an) for w in ("Winner", "Loser", "TBD"))
    upcoming = [m for m in upcoming if real_teams(m)]
    upcoming.sort(key=lambda m: m.get("kickoff_utc") or "")
    upcoming = upcoming[:limit]
    print(f"[lowdown] {len(upcoming)} matches in the next {days_ahead}d with predictions")

    existing = {(l["match_id"]): l for l in
                db.page_all("lowdowns", "match_id,inputs_hash", version=LOWDOWN_VERSION)}

    written = skipped = failed = 0
    for m in upcoming:
        dossier = build_dossier(m, teams, leagues, all_matches, all_stats,
                                ratings, predictions)
        h = dossier_hash(dossier)
        prev = existing.get(m["id"])
        if prev and prev["inputs_hash"] == h:
            skipped += 1
            continue
        label = f"{dossier['fixture']['home']} vs {dossier['fixture']['away']}"
        try:
            out = generate_lowdown(dossier)
        except Exception as e:
            print(f"[lowdown] {label}: generation failed: {e}")
            failed += 1
            continue
        if not out:
            print(f"[lowdown] {label}: empty/refused output — skipped")
            failed += 1
            continue
        db.upsert("lowdowns", [{
            "match_id": m["id"],
            "version": LOWDOWN_VERSION,
            "paragraphs": out["paragraphs"],
            "verdict": out.get("verdict"),
            "inputs_hash": h,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }], on_conflict="match_id,version")
        written += 1
        print(f"[lowdown] {label}: written ({len(out['paragraphs'])} paragraphs)")

    print(f"[lowdown] done: {written} written, {skipped} unchanged, {failed} failed")
    return {"status": "ok", "written": written, "skipped": skipped, "failed": failed}


if __name__ == "__main__":
    print(run())

"""
The Lowdown — LLM-written match commentary, ported from the WC26 visualizer
and rebuilt on real data.

The WC26 lowdown was template-driven (seeded phrase banks over factor bars).
This version keeps its voice — "a blend of a sharp studio host, a tactical
ex-pro, and a swaggering striker" — but feeds a multi-agent pipeline with the
full footy-mp dataset: model ratings + predictions, per-match xG, player-level
form, momentum trends, head-to-head, and knockout context.

Three states, like the original (each match's row transitions in place):
  pre  — the full preview: 4 analyst agents + synthesizer, 3-4 paragraphs.
  live — in-game read: synthesizer only (fast/cheap, regenerated as the
         score changes or every ~20 game minutes), 1-2 paragraphs.
  post — the full-time verdict: did the model's read land or eat crow,
         2-3 paragraphs. Written once, then stable.

Flow per match:
  1. build_dossier()  — pure data pull from Supabase, no LLM.
  2. analyst agents   — four focused passes (pre-match only).
  3. synthesizer      — paragraphs + a bold verdict in the WC26 voice,
                        grounded ONLY in the dossier + analyst notes.
  4. upsert into `lowdowns` keyed on (match_id, version); an inputs hash
                        skips regeneration when nothing changed.

Requires ANTHROPIC_API_KEY. Runs via `python -m data.pipeline lowdown`
(all states) or from the live cron (live matches only).
"""
from __future__ import annotations

import hashlib
import json
import os
from datetime import datetime, timedelta, timezone

from data import db

LOWDOWN_VERSION = "lowdown-v1"
# Hybrid model split: the four analyst passes are structured data-reads — Sonnet
# handles them at ~1/5 the cost. Opus writes only the final synthesized voice.
GEN_MODEL = os.environ.get("LOWDOWN_GEN_MODEL", "claude-opus-4-8")
ANALYST_MODEL = os.environ.get("LOWDOWN_ANALYST_MODEL", "claude-sonnet-5")
# Hard ceiling on LLM calls per run (a pre-match lowdown = 5 calls). The runner
# stops cleanly when the budget is spent and picks up next run.
MAX_LLM_CALLS = int(os.environ.get("LOWDOWN_MAX_CALLS") or 60)
MODEL_VERSION = "footy-mp-v2"  # which predictions/ratings feed the dossier

_calls_made = 0


class _BudgetExhausted(Exception):
    pass


def _spend_call() -> None:
    global _calls_made
    if _calls_made >= MAX_LLM_CALLS:
        raise _BudgetExhausted()
    _calls_made += 1


# ------------------------------ dossier ------------------------------

def _season_start_iso() -> str:
    now = datetime.now(timezone.utc)
    y = now.year if now.month >= 8 else now.year - 1
    return f"{y}-08-01T00:00:00Z"


# ESPN phase slugs → what the occasion actually is. The writer must know the
# difference between "a knockout tie" and "the final" — the stakes copy hangs
# on it.
_STAGE_LABELS = {
    "final": "Final",
    "finals": "Final",
    "3rd-place-playoff": "Third-place play-off",
    "third-place-playoff": "Third-place play-off",
    "semifinals": "Semi-final",
    "semifinal": "Semi-final",
    "quarterfinals": "Quarter-final",
    "quarterfinal": "Quarter-final",
    "round-of-16": "Round of 16",
    "round-of-32": "Round of 32",
    "playoff-round": "Play-off round",
    "knockout-round-playoffs": "Knockout play-off round",
    "group-stage": "Group stage",
    "league-stage": "League phase",
    "regular-season": "Regular season",
}


def stage_context(match: dict, league: dict) -> dict:
    """Turn matches.phase / is_knockout into explicit occasion context for the
    writers. A World Cup final must never read like a generic knockout tie."""
    phase = (match.get("phase") or "").strip().lower()
    label = _STAGE_LABELS.get(phase) or (
        phase.replace("-", " ").title() if phase else None)
    comp = league.get("name") or "this competition"
    is_final = phase in ("final", "finals")
    note = None
    if is_final:
        note = (f"THIS IS THE {comp.upper()} FINAL — the trophy match, winner "
                f"takes it all, no second chances and no next round. Frame the "
                f"entire piece around the occasion.")
    elif phase in ("semifinals", "semifinal"):
        note = f"Semi-final: the winner goes to the {comp} final."
    elif phase in ("3rd-place-playoff", "third-place-playoff"):
        note = "Third-place play-off: the consolation match, bronze on the line."
    elif match.get("is_knockout"):
        note = "Knockout round: lose and go home."
    return {
        "stage": label,
        "is_knockout": bool(match.get("is_knockout")),
        "is_final": is_final,
        "season": match.get("season"),
        "occasion_note": note,
    }


def _fixture_header(dossier: dict) -> str:
    """`Match:` line for the prompts — includes the stage so the writer can't
    miss the occasion."""
    fx = dossier["fixture"]
    comp = fx.get("competition") or ""
    stage = fx.get("stage")
    comp_bit = f"{comp} — {stage.upper()}" if stage else comp
    return f"Match: {fx['home']} vs {fx['away']} ({comp_bit})"


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
    state = match_state(match)
    dossier = {
        "fixture": {
            "home": team_name.get(hid), "away": team_name.get(aid),
            "kickoff_utc": match.get("kickoff_utc"),
            "competition": league.get("name"),
            "is_international": bool(league.get("is_international")),
            "status": match.get("status"),
            **stage_context(match, league),
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

    if state == "live":
        dossier["live"] = {
            "score": f"{match.get('home_goals') or 0}-{match.get('away_goals') or 0}",
            "minute": match.get("minute"),
        }
    elif state == "post":
        dossier["result"] = {
            "final_score": f"{match.get('home_goals')}-{match.get('away_goals')}",
            "went_extra_time": bool(match.get("went_et")),
            "penalties": f"{match.get('pens_home')}-{match.get('pens_away')}"
                         if match.get("went_pens") else None,
        }
    return dossier


def match_state(match: dict) -> str:
    if match.get("status") == "live":
        return "live"
    if match.get("status") == "final":
        return "post"
    return "pre"


def dossier_hash(dossier: dict) -> str:
    """Hash of everything that should trigger a regeneration. For live matches
    the raw minute is bucketed (~20 game minutes) so the 15-minute cron doesn't
    rewrite an unchanged game every tick."""
    d = dict(dossier)
    if "live" in d:
        live = dict(d["live"])
        live["minute"] = (live.get("minute") or 0) // 20
        d = {**d, "live": live}
    return hashlib.md5(json.dumps(d, sort_keys=True).encode()).hexdigest()


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
- Paragraph 1: the setup — what this match is, both teams' form/state. Take
  the occasion from fixture.stage / fixture.occasion_note and write to it: a
  FINAL is the trophy match and the whole piece should carry that weight; a
  semi-final is a shot at the final; a group game is a group game. Never call
  a final "a knockout tie".
- Paragraph 2: the matchup — tactics, key players, where it's won and lost.
- Paragraph 3: the verdict paragraph — lead with the call, back it with the
  model's numbers (win probabilities, expected goals), state the predicted
  angle plainly. Confidence must match the probability gap: >=25 points of
  win-probability gap means call it flat out; 14-24 means "should handle
  this"; under 8 means say it's a genuine coin flip.
- Optional paragraph 4: stakes — knockout math (extra time/pens probability,
  shootout nerve), or what the result means. Include when relevant. In a
  final, this paragraph is not optional: this is the last match — what's on
  the line is the trophy itself.
- Also produce "verdict": ONE punchy sentence with the call and most likely
  scoreline (derive a plausible scoreline from the expected goals; round
  sensibly). This appears in bold above the paragraphs.

Hard rules: every number must come from the dossier. Never fabricate stats,
injuries, quotes, or history. If player data is missing for a team, talk
about the team, not imaginary players. Write for a reader who sees this next
to the probability bars — do not re-list every probability, weave in the two
or three that matter."""

LIVE_SYSTEM = VOICE + """

The match is LIVE. You are given the dossier including the current score and
minute, plus the model's pre-match read. Write the in-game lowdown:

- 1 or 2 paragraphs, 2-3 sentences each. Urgent, present tense.
- Open with the state of the game: score, minute, who's on top. Carry the
  occasion (fixture.stage / occasion_note) — a final that's level late is a
  different sentence than a group game that's level late.
- Measure it against the pre-match read — is the favorite delivering, is the
  underdog pulling something, what does the trailing side need and how long
  have they got.
- "verdict": ONE present-tense line on where this is heading.

Hard rules: every number from the dossier. You know the score and minute —
you do NOT know scorers, cards, or events, so never invent them. Talk about
teams and the pre-match numbers, not imagined incidents."""

POST_SYSTEM = VOICE + """

Full time. You are given the dossier including the final result and the
model's pre-match prediction. Write the post-match lowdown:

- 2 or 3 paragraphs, 2-4 sentences each.
- Paragraph 1: the result, plainly and with flavor — score, extra time or
  penalties if they happened, what kind of result it reads as. If
  fixture.is_final is true, this was the trophy match: the winner are
  champions — say so.
- Paragraph 2: the model's reckoning — what the pre-match numbers said and
  whether the read landed or ate crow. Be honest either way; if the model
  priced the winner under 30%, say it got beat. If the favorite landed,
  take the small victory lap.
- Optional paragraph 3: what it means — who advances, form lines extended or
  snapped, anything the data actually supports.
- "verdict": ONE punchy line summarizing the result and whether the model
  called it.

Hard rules: every number from the dossier. You know the final score and
whether it went to extra time or penalties — you do NOT know scorers or
events, so never invent them."""


def _client():
    import anthropic
    return anthropic.Anthropic()


def _ask(client, system: str, user: str, max_tokens: int = 1200) -> str:
    _spend_call()
    resp = client.messages.create(
        model=ANALYST_MODEL,
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


def generate_lowdown(dossier: dict, state: str = "pre") -> dict | None:
    """Run the pipeline for one match dossier. Pre-match gets the full analyst
    panel; live and post are synthesizer-only (the dossier already carries the
    numbers, and live regenerates too often to justify four extra calls)."""
    client = _client()
    d = json.dumps(dossier, indent=1)
    home = dossier["fixture"]["home"]
    away = dossier["fixture"]["away"]
    header = _fixture_header(dossier)
    occasion = dossier["fixture"].get("occasion_note")
    occasion_line = f"\nOCCASION: {occasion}\n" if occasion else ""

    if state in ("live", "post"):
        system = LIVE_SYSTEM if state == "live" else POST_SYSTEM
        prompt = (
            f"{header}\n{occasion_line}\n"
            f"DOSSIER (source of truth):\n{d}\n\n"
            f"Write the {'in-game' if state == 'live' else 'post-match'} lowdown now."
        )
        return _synthesize(client, system, prompt, max_tokens=1200)

    analysts = {
        "home_team": f"Analyze {home} (the home side) only: their model ratings, "
                     f"season xG profile, and recent form.\n\nDossier:\n{d}",
        "away_team": f"Analyze {away} (the away side) only: their model ratings, "
                     f"season xG profile, and recent form.\n\nDossier:\n{d}",
        "players":   f"Analyze the player matchup for {home} vs {away}: key players, "
                     f"hot/cold streaks (last-3 goal involvements vs season rate), and "
                     f"who decides this game.\n\nDossier:\n{d}",
        "momentum":  f"Analyze momentum and stakes for {home} vs {away}: the occasion "
                     f"(fixture.stage / fixture.occasion_note — a final or semi-final "
                     f"changes everything), form trends (last-5 xG vs season xG), "
                     f"head-to-head, knockout context (extra-time/pens probabilities, "
                     f"temper ratings) if present.\n\nDossier:\n{d}",
    }
    notes = {}
    for key, prompt in analysts.items():
        notes[key] = _ask(client, ANALYST_SYSTEM, prompt)

    synth_prompt = (
        f"{header}\n{occasion_line}\n"
        f"DOSSIER (source of truth):\n{d}\n\n"
        f"ANALYST NOTES:\n"
        f"[{home}]\n{notes['home_team']}\n\n"
        f"[{away}]\n{notes['away_team']}\n\n"
        f"[players]\n{notes['players']}\n\n"
        f"[momentum & stakes]\n{notes['momentum']}\n\n"
        f"Write the lowdown now."
    )
    return _synthesize(client, SYNTH_SYSTEM, synth_prompt, max_tokens=2000)


def _synthesize(client, system: str, prompt: str, max_tokens: int) -> dict | None:
    _spend_call()
    resp = client.messages.create(
        model=GEN_MODEL,
        max_tokens=max_tokens,
        system=system,
        output_config={"format": {"type": "json_schema", "schema": LOWDOWN_SCHEMA}},
        messages=[{"role": "user", "content": prompt}],
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
        "home_goals,away_goals,went_pens,pens_home,pens_away,"
        "phase,is_knockout,season")
    all_stats = db.page_all("team_match_stats", "match_id,team_id,xg,xga")

    ratings = {}
    for r in db.page_all("model_ratings", "*", model_version=MODEL_VERSION):
        cur = ratings.get(r["team_id"])
        if cur is None or r["as_of_date"] > cur["as_of_date"]:
            ratings[r["team_id"]] = r

    predictions = {p["match_id"]: p for p in
                   db.page_all("predictions", "*", model_version=MODEL_VERSION)}
    return teams, leagues, all_matches, all_stats, ratings, predictions


def _select_matches(all_matches, teams, predictions, days_ahead: int,
                    states: tuple[str, ...]) -> list[dict]:
    """Matches that deserve a lowdown right now, per requested states:
    pre = scheduled within the horizon; live = live now; post = finished in
    the last 72h. All must have a prediction and two real (non-placeholder)
    teams."""
    now = datetime.now(timezone.utc)
    horizon = (now + timedelta(days=days_ahead)).isoformat()
    lookback = (now - timedelta(hours=72)).isoformat()

    def real_teams(m):
        hn = teams.get(m["home_team_id"], {}).get("name", "")
        an = teams.get(m["away_team_id"], {}).get("name", "")
        return not any(w in (hn + an) for w in ("Winner", "Loser", "TBD"))

    out = []
    for m in all_matches:
        if m["id"] not in predictions or not real_teams(m):
            continue
        ko = m.get("kickoff_utc") or ""
        st = match_state(m)
        if st not in states:
            continue
        if st == "pre" and not (now.isoformat() <= ko <= horizon):
            continue
        if st == "post" and not (lookback <= ko):
            continue
        out.append(m)
    out.sort(key=lambda m: m.get("kickoff_utc") or "")
    return out


def run(days_ahead: int = 7, limit: int | None = None,
        states: tuple[str, ...] = ("pre", "live", "post")) -> dict:
    """Generate/refresh lowdowns. The daily job runs all states; the live cron
    calls run(states=("live",)) so in-game reads update as scores change."""
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("[lowdown] ANTHROPIC_API_KEY not set — skipping (not an error)")
        return {"status": "skipped_no_key"}

    limit = limit or int(os.environ.get("PIPELINE_LOWDOWN_LIMIT") or 12)
    teams, leagues, all_matches, all_stats, ratings, predictions = _load_context()
    candidates = _select_matches(all_matches, teams, predictions, days_ahead, states)[:limit]
    print(f"[lowdown] {len(candidates)} candidate matches (states={','.join(states)})")

    existing = {l["match_id"]: l for l in
                db.page_all("lowdowns", "match_id,inputs_hash,state", version=LOWDOWN_VERSION)}

    written = skipped = failed = 0
    for m in candidates:
        state = match_state(m)
        dossier = build_dossier(m, teams, leagues, all_matches, all_stats,
                                ratings, predictions)
        h = dossier_hash(dossier)
        prev = existing.get(m["id"])
        if prev and prev["inputs_hash"] == h and prev.get("state") == state:
            skipped += 1
            continue
        # post-match reads are written once — don't churn them on data drift
        if prev and prev.get("state") == "post" and state == "post":
            skipped += 1
            continue
        label = f"{dossier['fixture']['home']} vs {dossier['fixture']['away']} [{state}]"
        try:
            out = generate_lowdown(dossier, state)
        except _BudgetExhausted:
            print(f"[lowdown] call budget ({MAX_LLM_CALLS}) spent — stopping; "
                  f"remaining matches pick up next run")
            break
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
            "state": state,
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

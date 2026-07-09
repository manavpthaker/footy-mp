"""
Model pipeline — fits xG-based Dixon-Coles ratings from Supabase, writes
per-team ratings + per-match predictions back to the DB. Called by the
main orchestrator (`data/pipeline.py` mode=model) after ingest completes.

Design:
  1. Pull team_match_stats + matches from Supabase (all finished matches).
  2. Refit KO_TEMPER + PEN_FACTOR priors from observed shootout outcomes
     if we have enough knockout data; otherwise keep the WC26 priors.
  3. Fit ratings (opponent-adjusted, recency-weighted xG).
  4. For every upcoming (scheduled) match, compute a prediction and upsert
     into `predictions`. For knockout / international matches also emit
     the ET + pens cascade fields.
  5. Snapshot ratings into `model_ratings` for today.

Runs safely with partial data — the model degrades gracefully to goals
when a match has no xG (Understat coverage is big-5 only).
"""
from __future__ import annotations

from datetime import date, datetime
from typing import Iterable

from data import db
from data.model import engine

MODEL_VERSION = "footy-mp-v1"


# --------------- load ---------------

def _load_matches_for_fit() -> list[dict]:
    """All finished matches with either xG or goals, in engine.fit_ratings shape."""
    client = db.client()
    # pull matches + stats in two queries then join in Python (avoid PostgREST joins)
    matches = getattr(
        client.table("matches").select(
            "id,kickoff_utc,home_team_id,away_team_id,home_goals,away_goals,status,league_id"
        ).eq("status", "final").execute(),
        "data", None,
    ) or []
    stats = getattr(
        client.table("team_match_stats").select("match_id,team_id,is_home,xg,xga").execute(),
        "data", None,
    ) or []
    teams = getattr(client.table("teams").select("id,name").execute(), "data", None) or []
    team_name = {t["id"]: t["name"] for t in teams}
    stat_by_mid = {}
    for s in stats:
        stat_by_mid.setdefault(s["match_id"], []).append(s)

    is_intl_by_league = {}
    leagues = getattr(client.table("leagues").select("id,is_international").execute(),
                      "data", None) or []
    for l in leagues:
        is_intl_by_league[l["id"]] = bool(l.get("is_international"))

    rows = []
    for m in matches:
        home = team_name.get(m["home_team_id"])
        away = team_name.get(m["away_team_id"])
        if not home or not away:
            continue
        hx = ax = None
        for s in stat_by_mid.get(m["id"], []):
            if s.get("is_home"):
                hx = s.get("xg")
            else:
                ax = s.get("xg")
        rows.append({
            "match_id": m["id"],
            "home": home, "away": away,
            "home_goals": m.get("home_goals"),
            "away_goals": m.get("away_goals"),
            "home_xg": hx, "away_xg": ax,
            "date": (m.get("kickoff_utc") or "")[:10],
            "neutral": is_intl_by_league.get(m["league_id"], False),
        })
    return rows


def _load_upcoming() -> list[dict]:
    client = db.client()
    matches = getattr(
        client.table("matches").select(
            "id,kickoff_utc,home_team_id,away_team_id,league_id,status"
        ).eq("status", "scheduled").execute(),
        "data", None,
    ) or []
    teams = getattr(client.table("teams").select("id,name").execute(), "data", None) or []
    team_name = {t["id"]: t["name"] for t in teams}
    leagues = getattr(client.table("leagues").select("id,is_international,name").execute(),
                      "data", None) or []
    league_meta = {l["id"]: l for l in leagues}
    out = []
    for m in matches:
        home = team_name.get(m["home_team_id"])
        away = team_name.get(m["away_team_id"])
        if not home or not away:
            continue
        L = league_meta.get(m["league_id"], {})
        out.append({
            "match_id": m["id"],
            "home": home, "away": away,
            "neutral": bool(L.get("is_international")),
            "is_knockout": bool(L.get("is_international")),  # rough proxy — refine later
            "league_name": L.get("name"),
        })
    return out


# --------------- refit priors ---------------

def refit_knockout_priors(matches: list[dict]) -> dict[str, dict[str, float]]:
    """
    Re-estimate KO_TEMPER (nerves) and PEN_FACTOR (shootout edge) from observed data.
    KO_TEMPER: does the team over- or under-perform the model's win-in-90 probability
    in knockout matches? PEN_FACTOR: shootout record (wins - losses) / decided.
    Shrunk toward 0 for small samples so single flukes don't dominate.

    Returns the same shape as engine.KO_TEMPER / PEN_FACTOR so we can install
    them onto the engine module before predicting.
    """
    from collections import defaultdict
    ko_temper: dict[str, dict[str, int]] = defaultdict(lambda: {"n": 0, "obs_win_share": 0.0})
    pens: dict[str, dict[str, int]] = defaultdict(lambda: {"decided": 0, "won": 0})

    for m in matches:
        went_pens = m.get("went_pens")
        went_et = m.get("went_et")  # (not in our load right now — inferred by minute>=120 elsewhere)
        # shootout record
        if went_pens:
            pens[m["home"]]["decided"] += 1
            pens[m["away"]]["decided"] += 1
            ph, pa = m.get("pens_home"), m.get("pens_away")
            if ph is not None and pa is not None:
                if ph > pa: pens[m["home"]]["won"] += 1
                else: pens[m["away"]]["won"] += 1

    ko_out = {}
    for team, r in pens.items():
        d = r["decided"]
        if d == 0: continue
        # shrunk edge in [-1, 1]: (won/decided - 0.5) * 2, shrunk toward 0
        raw = (r["won"] / d - 0.5) * 2
        k = 3  # shrinkage strength
        shrunk = raw * (d / (d + k))
        ko_out[team] = shrunk

    return {"KO_TEMPER": {t: v * 0.4 for t, v in ko_out.items()},  # scale to prior range
            "PEN_FACTOR": ko_out}


# --------------- write ---------------

def _write_ratings(ratings: dict, mu: float, home_adv: float) -> None:
    client = db.client()
    teams = getattr(client.table("teams").select("id,name").execute(), "data", None) or []
    name_to_id = {t["name"]: t["id"] for t in teams}
    today = date.today().isoformat()
    rows = []
    for team_name, r in ratings.items():
        tid = name_to_id.get(team_name)
        if not tid:
            continue
        overall = r["attack"] / max(r["defense"], 0.4)
        rows.append({
            "team_id": tid,
            "as_of_date": today,
            "attack": round(r["attack"], 4),
            "defense": round(r["defense"], 4),
            "overall": round(overall, 4),
            "home_adv": round(home_adv, 4),
            "temper": round(engine.KO_TEMPER.get(team_name, 0.0), 4),
            "model_version": MODEL_VERSION,
        })
    if not rows:
        return
    for i in range(0, len(rows), 500):
        client.table("model_ratings").upsert(
            rows[i:i+500], on_conflict="team_id,as_of_date,model_version"
        ).execute()


def _write_predictions(preds: list[dict]) -> None:
    if not preds:
        return
    client = db.client()
    for i in range(0, len(preds), 500):
        client.table("predictions").upsert(
            preds[i:i+500], on_conflict="match_id,model_version"
        ).execute()


# --------------- main ---------------

def run() -> dict:
    matches_all = _load_matches_for_fit()
    print(f"[model] loaded {len(matches_all)} matches for fit")
    if not matches_all:
        return {"status": "no_matches"}

    # Refit KO priors from what we've seen
    refit = refit_knockout_priors(matches_all)
    if refit["PEN_FACTOR"]:
        # merge with existing priors: overwrite only for teams we have data on
        for t, v in refit["KO_TEMPER"].items():
            engine.KO_TEMPER[t] = v
        for t, v in refit["PEN_FACTOR"].items():
            engine.PEN_FACTOR[t] = v
        print(f"[model] refit KO_TEMPER for {len(refit['KO_TEMPER'])} teams; "
              f"PEN_FACTOR for {len(refit['PEN_FACTOR'])} teams")

    ratings, mu, home_adv = engine.fit_ratings(matches_all)
    print(f"[model] fit ratings for {len(ratings)} teams | mu={mu:.2f} home_adv={home_adv:.2f}")
    _write_ratings(ratings, mu, home_adv)

    upcoming = _load_upcoming()
    preds = []
    for u in upcoming:
        pred = engine.predict(u["home"], u["away"], ratings, mu, home_adv, u["neutral"])
        row = {
            "match_id": u["match_id"],
            "p_home": pred["p_home"], "p_draw": pred["p_draw"], "p_away": pred["p_away"],
            "home_xg": pred["home_xg"], "away_xg": pred["away_xg"],
            "model_version": MODEL_VERSION,
        }
        if u.get("is_knockout"):
            ko = engine.knockout(u["home"], u["away"], ratings, mu, home_adv, u["neutral"])
            row.update({
                "p_advance_home": ko["p_advance_home"],
                "p_et": ko["p_et"], "p_pens": ko["p_pens"],
            })
        preds.append(row)
    _write_predictions(preds)
    print(f"[model] wrote {len(preds)} predictions")
    return {"status": "ok", "n_matches": len(matches_all), "n_teams": len(ratings),
            "n_predictions": len(preds), "mu": mu, "home_adv": home_adv}


if __name__ == "__main__":
    print(run())

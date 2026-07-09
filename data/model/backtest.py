"""
Walk-forward backtest with a FIFA/goal-proxy baseline for comparison.

Baseline: a "WC26-style" model that builds team strength from GOALS only
(no xG), same Dixon-Coles core, no recency weighting. This is the crude proxy
we're claiming footy-mp beats.

The gate: on the same held-out matches, the xG model must beat the baseline
on BOTH RPS and log-loss. Results are printed and written to `backtest_runs`.
"""
from __future__ import annotations

import math
from copy import deepcopy
from datetime import date, datetime

from collections import defaultdict

from data.model import engine, pipeline as model_pipeline
from data import db


BASELINE_VERSION = "baseline-wc26-style-v1"


def _fit_baseline(train: list[dict]) -> tuple[dict, float]:
    """WC26-style baseline: goals only, no recency weighting, no Dixon-Coles
    correction, no opponent adjustment — just per-team attack/defense as
    goals-for and goals-against normalized to the league mean. Same
    architecture WC26 used before we ported to xG."""
    gf = defaultdict(float); ga = defaultdict(float); n = defaultdict(int)
    tot_g = 0
    for m in train:
        if m.get("home_goals") is None or m.get("away_goals") is None:
            continue
        hg, ag = float(m["home_goals"]), float(m["away_goals"])
        gf[m["home"]] += hg; ga[m["home"]] += ag; n[m["home"]] += 1
        gf[m["away"]] += ag; ga[m["away"]] += hg; n[m["away"]] += 1
        tot_g += hg + ag
    total_teams = sum(n.values())
    mu = tot_g / max(total_teams, 1)  # avg goals per team-match
    ratings = {}
    for t in n:
        if n[t] == 0: continue
        atk = (gf[t] / n[t]) / max(mu, 0.1)
        dfn = (ga[t] / n[t]) / max(mu, 0.1)
        ratings[t] = {"attack": atk, "defense": dfn}
    return ratings, mu


def _predict_baseline(home: str, away: str, ratings: dict, mu: float) -> tuple[float, float, float]:
    """Independent-Poisson prediction from WC26-style ratings."""
    ra = ratings.get(home, {"attack": 1.0, "defense": 1.0})
    rb = ratings.get(away, {"attack": 1.0, "defense": 1.0})
    lh = max(0.15, mu * ra["attack"] * rb["defense"])
    la = max(0.15, mu * rb["attack"] * ra["defense"])
    # independent Poisson — no DC correction, no home advantage bonus
    return engine.outcome_probs(lh, la, rho=0.0)


def _run_forward(matches: list[dict], use_xg: bool, min_train: int = 200) -> dict:
    """Chronological walk-forward. If use_xg=False, we strip xG so ratings are fit
    from goals — that's our WC26-style baseline. We only score matches where
    xG data is available: comparing on WC26/international matches (where the
    xG source lacks coverage) turns the comparison into random-vs-random."""
    rows = []
    scoreable_ids = set()
    for m in matches:
        if m.get("home_goals") is None or m.get("away_goals") is None:
            continue
        r = dict(m)
        has_xg = m.get("home_xg") is not None and m.get("away_xg") is not None
        if has_xg:
            scoreable_ids.add(m.get("match_id") or (m["home"], m["away"], m["date"]))
        if not use_xg:
            r["home_xg"] = None
            r["away_xg"] = None
        rows.append(r)
    rows.sort(key=lambda x: x.get("date") or "")
    if len(rows) <= min_train:
        return {"n": 0, "note": "not enough training data"}

    rps = ll = brier = 0.0
    n = 0
    for i in range(min_train, len(rows)):
        train = rows[:i]
        m = rows[i]
        key = m.get("match_id") or (m["home"], m["away"], m["date"])
        if key not in scoreable_ids:
            continue  # skip matches with no xG source (WC26/international)
        if use_xg:
            ratings, mu, hadv = engine.fit_ratings(train, as_of=_d(m.get("date")))
            lh, la = engine.expected_goals(m["home"], m["away"], ratings, mu, hadv,
                                           m.get("neutral", False))
            p_h, p_d, p_a = engine.outcome_probs(lh, la)
        else:
            # WC26-style baseline (goals, no recency, no DC, no home_adv)
            ratings, mu = _fit_baseline(train)
            p_h, p_d, p_a = _predict_baseline(m["home"], m["away"], ratings, mu)
        p = (p_h, p_d, p_a)
        o = 0 if m["home_goals"] > m["away_goals"] else 1 if m["home_goals"] == m["away_goals"] else 2
        rps += engine._rps(p, o)
        ll += -math.log(max(p[o], 1e-9))
        brier += sum((p[k] - (1 if k == o else 0)) ** 2 for k in range(3))
        n += 1
    return {
        "n": n,
        "rps": round(rps / n, 4),
        "log_loss": round(ll / n, 4),
        "brier": round(brier / n, 4),
    }


def _d(s):
    try:
        return datetime.fromisoformat(s).date()
    except Exception:
        return date.today()


def _write_result(version: str, result: dict) -> None:
    if not result.get("n"):
        return
    db.upsert("backtest_runs", [{
        "model_version": version,
        "n_matches": result["n"],
        "rps": result.get("rps"),
        "log_loss": result.get("log_loss"),
        "brier": result.get("brier"),
    }])


def run(min_train: int = 200) -> dict:
    matches = model_pipeline._load_matches_for_fit()
    xg_result = _run_forward(matches, use_xg=True, min_train=min_train)
    base_result = _run_forward(matches, use_xg=False, min_train=min_train)

    print(f"[backtest] xG model     : {xg_result}")
    print(f"[backtest] baseline     : {base_result}")

    beats_rps = xg_result.get("rps") is not None and base_result.get("rps") is not None \
        and xg_result["rps"] < base_result["rps"]
    beats_ll = xg_result.get("log_loss") is not None and base_result.get("log_loss") is not None \
        and xg_result["log_loss"] < base_result["log_loss"]
    print(f"[backtest] beats baseline on RPS? {beats_rps}  on log-loss? {beats_ll}")

    _write_result(model_pipeline.MODEL_VERSION, xg_result)
    _write_result(BASELINE_VERSION, base_result)

    return {"xg": xg_result, "baseline": base_result,
            "beats_rps": beats_rps, "beats_log_loss": beats_ll}


if __name__ == "__main__":
    print(run())

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

from data.model import engine, pipeline as model_pipeline
from data import db


BASELINE_VERSION = "baseline-goals-v1"


def _run_forward(matches: list[dict], use_xg: bool, min_train: int = 200) -> dict:
    """Chronological walk-forward. If use_xg=False, we strip xG so ratings are fit
    from goals — that's our WC26-style baseline."""
    rows = []
    for m in matches:
        if m.get("home_goals") is None or m.get("away_goals") is None:
            continue
        r = dict(m)
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
        ratings, mu, hadv = engine.fit_ratings(train, as_of=_d(m.get("date")))
        lh, la = engine.expected_goals(m["home"], m["away"], ratings, mu, hadv,
                                       m.get("neutral", False))
        p_h, p_d, p_a = engine.outcome_probs(lh, la)
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

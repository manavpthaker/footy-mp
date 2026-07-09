"""
footy-mp match model — xG-based Dixon-Coles engine.

Upgrade over the WC26 model: team strength comes from real expected goals
(opponent-adjusted, recency-weighted) instead of FIFA-points + goals proxies.
Keeps the parts of WC26 that backtested well: the Dixon-Coles low-score
correction (fixes independent-Poisson under-counting draws), a fitted home
advantage, and the knockout extra-time -> penalty cascade with a nerves tilt.

Input: an iterable of match dicts with keys:
    home, away, home_xg, away_xg, home_goals, away_goals, date (ISO), neutral(bool)
Output: per-team attack/defense ratings and match predictions.

No hard dependency on Supabase — pass in a list of matches from anywhere
(DB, CSV, ESPN+Understat join). Pure-Python + math only, so it runs anywhere.
"""
from __future__ import annotations
import math
from collections import defaultdict
from datetime import date, datetime

# ---- knockout temperament (ported from WC26, data-derived shootout/KO record) ----
# Re-fit on the larger footy-mp dataset over time; these are the WC26 priors.
KO_TEMPER = {
    'Argentina': 0.61, 'Croatia': 0.56, 'Morocco': 0.50, 'Uruguay': 0.20, 'France': 0.16,
    'Senegal': 0.15, 'Japan': 0.11, 'Portugal': -0.07, 'Colombia': 0.0, 'Switzerland': 0.0,
    'Spain': -0.24, 'Netherlands': -0.24, 'Germany': -0.26, 'Brazil': -0.28, 'England': 0.0,
}
NERVE_W = 0.10
PEN_FACTOR = {  # shootout edge beyond strength (keeper + record)
    'Argentina': 0.55, 'Croatia': 0.50, 'Morocco': 0.35, 'Switzerland': 0.15,
    'Brazil': -0.20, 'England': -0.20, 'Spain': -0.20, 'Netherlands': -0.10,
}

DC_RHO = -0.06      # Dixon-Coles low-score correction (fitted; boosts 0-0/1-1)
HALF_LIFE_DAYS = 240  # recency weighting for xG ratings


# --------------------------------------------------------------------------
# 1. RATINGS — opponent-adjusted, recency-weighted xG attack/defense
# --------------------------------------------------------------------------
def _weight(match_date: str, as_of: date) -> float:
    try:
        d = datetime.fromisoformat(match_date).date()
    except Exception:
        return 1.0
    age = max(0, (as_of - d).days)
    return 0.5 ** (age / HALF_LIFE_DAYS)


def fit_ratings(matches, as_of: date | None = None, passes: int = 6):
    """
    Returns dict: team -> {'attack': a, 'defense': d}, plus league xG mean and home_adv.
    attack  > 1  => scores more xG than average
    defense < 1  => concedes less xG than average (good)
    Iterative opponent adjustment: a team's attack is judged relative to the
    defenses it faced, and vice versa. Uses xG (falls back to goals if xG missing).
    """
    as_of = as_of or date.today()
    rows = []
    for m in matches:
        hx = m.get('home_xg'); ax = m.get('away_xg')
        if hx is None: hx = m.get('home_goals')
        if ax is None: ax = m.get('away_goals')
        if hx is None or ax is None:
            continue
        rows.append((m['home'], m['away'], float(hx), float(ax),
                     bool(m.get('neutral', False)), _weight(m.get('date', ''), as_of)))
    if not rows:
        return {}, 1.35, 1.0

    # league average xG per team-match, and home advantage (home xG / away xG)
    tot_w = sum(r[5] for r in rows)
    mu = sum((r[2] + r[3]) * r[5] for r in rows) / (2 * tot_w)
    hw = sum(r[2] * r[5] for r in rows if not r[4])
    aw = sum(r[3] * r[5] for r in rows if not r[4])
    home_adv = max(1.0, min(1.5, (hw / aw) if aw > 0 else 1.15))

    teams = set()
    for h, a, *_ in rows:
        teams.add(h); teams.add(a)
    attack = {t: 1.0 for t in teams}
    defense = {t: 1.0 for t in teams}

    for _ in range(passes):
        # attack_i = weighted avg of (xG_for / (mu * opp_defense * side_factor))
        af_num = defaultdict(float); af_den = defaultdict(float)
        df_num = defaultdict(float); df_den = defaultdict(float)
        for h, a, hx, ax, neutral, w in rows:
            hf = 1.0 if neutral else home_adv
            # home attacking, away defending
            af_num[h] += w * (hx / (mu * defense[a] * hf)); af_den[h] += w
            df_num[a] += w * (ax_ := ax) / (mu * attack[h])  # away conceded vs home attack
            df_den[a] += w
            # away attacking, home defending
            af_num[a] += w * (ax / (mu * defense[h])); af_den[a] += w
            df_num[h] += w * (hx / (mu * attack[a] * hf)); df_den[h] += w
        for t in teams:
            if af_den[t]: attack[t] = _shrink(af_num[t] / af_den[t])
            if df_den[t]: defense[t] = _shrink(df_num[t] / df_den[t])

    ratings = {t: {'attack': attack[t], 'defense': defense[t]} for t in teams}
    return ratings, mu, home_adv


def _shrink(v, k=0.25):
    """Pull extreme ratings toward 1.0 (regularization for small samples)."""
    return max(0.35, min(2.2, 1.0 + (v - 1.0) * (1 - k)))


# --------------------------------------------------------------------------
# 2. EXPECTED GOALS + DIXON-COLES SCORELINE MATRIX
# --------------------------------------------------------------------------
def expected_goals(home, away, ratings, mu, home_adv, neutral=False):
    ra = ratings.get(home, {'attack': 1.0, 'defense': 1.0})
    rb = ratings.get(away, {'attack': 1.0, 'defense': 1.0})
    hf = 1.0 if neutral else home_adv
    lh = mu * ra['attack'] * rb['defense'] * hf
    la = mu * rb['attack'] * ra['defense']
    return max(0.15, lh), max(0.15, la)


def _pois(k, lam):
    return math.exp(-lam) * lam ** k / math.factorial(k)


def _dc_tau(i, j, lh, la, rho):
    # Dixon-Coles correction for the four low scorelines
    if i == 0 and j == 0: return 1 - lh * la * rho
    if i == 0 and j == 1: return 1 + lh * rho
    if i == 1 and j == 0: return 1 + la * rho
    if i == 1 and j == 1: return 1 - rho
    return 1.0


def score_matrix(lh, la, rho=DC_RHO, maxg=8):
    m = [[_pois(i, lh) * _pois(j, la) * _dc_tau(i, j, lh, la, rho)
          for j in range(maxg)] for i in range(maxg)]
    s = sum(sum(r) for r in m)
    return [[c / s for c in r] for r in m]


def outcome_probs(lh, la, rho=DC_RHO):
    m = score_matrix(lh, la, rho)
    h = sum(m[i][j] for i in range(len(m)) for j in range(len(m)) if i > j)
    d = sum(m[i][i] for i in range(len(m)))
    a = sum(m[i][j] for i in range(len(m)) for j in range(len(m)) if i < j)
    return h, d, a


def predict(home, away, ratings, mu, home_adv, neutral=False):
    lh, la = expected_goals(home, away, ratings, mu, home_adv, neutral)
    h, d, a = outcome_probs(lh, la)
    m = score_matrix(lh, la)
    best = max(((m[i][j], i, j) for i in range(len(m)) for j in range(len(m))),
               key=lambda x: x[0])
    return {'home': home, 'away': away, 'home_xg': round(lh, 2), 'away_xg': round(la, 2),
            'p_home': round(h, 4), 'p_draw': round(d, 4), 'p_away': round(a, 4),
            'modal_score': (best[1], best[2])}


# --------------------------------------------------------------------------
# 3. KNOCKOUT CASCADE — 90' -> extra time -> penalties (+ nerves)
# --------------------------------------------------------------------------
def shootout_prob(home, away, ratings):
    ra = ratings.get(home, {'attack': 1}); rb = ratings.get(away, {'attack': 1})
    tilt = 0.06 * math.tanh(ra['attack'] - rb['attack'])
    pf = 0.06 * (PEN_FACTOR.get(home, 0) - PEN_FACTOR.get(away, 0))
    return max(0.30, min(0.70, 0.5 + tilt + pf))


def knockout(home, away, ratings, mu, home_adv, neutral=True):
    """Probability HOME advances, honoring ET (1/3 goal rate) then penalties, plus a nerves tilt."""
    lh, la = expected_goals(home, away, ratings, mu, home_adv, neutral)
    h, d, a = outcome_probs(lh, la)
    het, aet, det = outcome_probs(lh / 3, la / 3)   # extra time
    win90 = h + d * het
    pens = d * det
    et_decided = d * (het + aet)
    so = shootout_prob(home, away, ratings)
    nerve = NERVE_W * (KO_TEMPER.get(home, 0) - KO_TEMPER.get(away, 0))
    adv = max(0.04, min(0.96, win90 + pens * so + nerve))
    return {'p_advance_home': round(adv, 4), 'p_et': round(et_decided + pens, 4),
            'p_pens': round(pens, 4), 'shootout_home': round(so, 3),
            'home_xg': round(lh, 2), 'away_xg': round(la, 2)}


# --------------------------------------------------------------------------
# 4. WALK-FORWARD BACKTEST (RPS / log-loss / Brier)
# --------------------------------------------------------------------------
def _rps(p, o):  # ranked probability score, lower is better
    cdf = [p[0], p[0] + p[1]]
    obs = [1, 1] if o == 0 else [0, 1] if o == 1 else [0, 0]
    return 0.5 * ((cdf[0] - obs[0]) ** 2 + (cdf[1] - obs[1]) ** 2)


def backtest(matches, min_train=200):
    """Chronological walk-forward: fit on the past, predict the next, score it."""
    ms = sorted((m for m in matches if m.get('home_goals') is not None),
                key=lambda m: m.get('date', ''))
    rps = ll = brier = 0.0
    n = 0
    for i in range(min_train, len(ms)):
        ratings, mu, hadv = fit_ratings(ms[:i], as_of=_d(ms[i].get('date')))
        m = ms[i]
        lh, la = expected_goals(m['home'], m['away'], ratings, mu, hadv, m.get('neutral', False))
        p = outcome_probs(lh, la)
        o = 0 if m['home_goals'] > m['away_goals'] else 1 if m['home_goals'] == m['away_goals'] else 2
        rps += _rps(p, o)
        ll += -math.log(max(p[o], 1e-9))
        brier += sum((p[k] - (1 if k == o else 0)) ** 2 for k in range(3))
        n += 1
    if not n:
        return {}
    return {'n': n, 'rps': round(rps / n, 4), 'log_loss': round(ll / n, 4),
            'brier': round(brier / n, 4)}


def _d(s):
    try:
        return datetime.fromisoformat(s).date()
    except Exception:
        return date.today()


if __name__ == '__main__':
    # tiny smoke test with synthetic xG
    demo = [
        {'home': 'A', 'away': 'B', 'home_xg': 2.1, 'away_xg': 0.7, 'home_goals': 2, 'away_goals': 0, 'date': '2026-01-10'},
        {'home': 'B', 'away': 'C', 'home_xg': 1.0, 'away_xg': 1.4, 'home_goals': 1, 'away_goals': 1, 'date': '2026-01-17'},
        {'home': 'C', 'away': 'A', 'home_xg': 0.8, 'away_xg': 1.9, 'home_goals': 0, 'away_goals': 2, 'date': '2026-01-24'},
    ]
    r, mu, hadv = fit_ratings(demo)
    print('mu', round(mu, 2), 'home_adv', round(hadv, 2))
    print(predict('A', 'C', r, mu, hadv))
    print(knockout('A', 'C', r, mu, hadv))

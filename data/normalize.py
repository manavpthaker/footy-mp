"""
Entity resolution — one canonical name per team/league so ESPN and Understat/FBref
join cleanly. The two sources spell things differently (Man United vs Manchester United,
Bayern vs Bayern München, Wolves vs Wolverhampton Wanderers, etc.).

The resolver is deliberately conservative: an alias must be an exact case-insensitive
hit after stripping accents/punct. Fuzzy matching would silently mis-join teams.
"""
from __future__ import annotations

import re
import unicodedata

# canonical name -> set of aliases seen in the wild across ESPN / Understat / FBref.
# Keep the canonical name equal to the ESPN displayName (that's the source we surface).
TEAM_ALIASES: dict[str, tuple[str, ...]] = {
    # Premier League
    "Manchester United": ("Man United", "Man Utd", "Manchester Utd"),
    "Manchester City":   ("Man City",),
    "Tottenham Hotspur": ("Tottenham", "Spurs"),
    "Newcastle United":  ("Newcastle",),
    "West Ham United":   ("West Ham",),
    "Wolverhampton Wanderers": ("Wolves", "Wolverhampton"),
    "Brighton & Hove Albion": ("Brighton",),
    "Nottingham Forest": ("Nott'm Forest", "Nottm Forest"),
    "Leicester City":    ("Leicester",),
    "Leeds United":      ("Leeds",),
    "Sheffield United":  ("Sheffield Utd",),
    # La Liga
    "Atlético Madrid":   ("Atletico Madrid", "Atletico", "Atlético"),
    "Athletic Bilbao":   ("Athletic Club", "Athletic"),
    "Real Betis":        ("Betis",),
    "Real Sociedad":     ("Sociedad",),
    "Rayo Vallecano":    ("Rayo",),
    "Celta Vigo":        ("Celta",),
    "Real Valladolid":   ("Valladolid",),
    # Bundesliga
    "Bayern Munich":     ("Bayern München", "FC Bayern München", "Bayern"),
    "Borussia Dortmund": ("Dortmund", "BVB"),
    "Bayer Leverkusen":  ("Leverkusen",),
    "RB Leipzig":        ("Leipzig",),
    "Borussia Mönchengladbach": ("Borussia Monchengladbach", "Gladbach", "M'gladbach"),
    "Eintracht Frankfurt": ("Frankfurt", "Eintracht"),
    "1. FC Köln":        ("Koln", "Köln", "FC Köln", "FC Koln"),
    "1. FC Union Berlin": ("Union Berlin",),
    "1. FSV Mainz 05":   ("Mainz 05", "Mainz"),
    "TSG Hoffenheim":    ("Hoffenheim",),
    "VfL Wolfsburg":     ("Wolfsburg",),
    "VfB Stuttgart":     ("Stuttgart",),
    "SC Freiburg":       ("Freiburg",),
    "FC Augsburg":       ("Augsburg",),
    "FC St. Pauli":      ("St. Pauli", "St Pauli"),
    "Werder Bremen":     ("Bremen",),
    # Serie A
    "Internazionale":    ("Inter", "Inter Milan"),
    "Milan":             ("AC Milan",),
    "Roma":              ("AS Roma",),
    "Napoli":            ("SSC Napoli",),
    "Hellas Verona":     ("Verona",),
    # Ligue 1
    "Paris Saint-Germain": ("Paris SG", "PSG", "Paris"),
    "Olympique Marseille": ("Marseille",),
    "Olympique Lyonnais":  ("Lyon", "Lyonnais"),
    "AS Monaco":         ("Monaco",),
    "Saint-Étienne":     ("Saint-Etienne", "St Etienne", "St. Etienne"),
    # National teams (ESPN uses simple country names)
    "United States":     ("USA", "USMNT", "United States of America"),
    "South Korea":       ("Korea Republic",),
    "North Korea":       ("Korea DPR", "DPR Korea"),
    "Ivory Coast":       ("Côte d'Ivoire", "Cote d'Ivoire"),
}

# league canonical name -> (espn_slug, understat_slug)
LEAGUE_SOURCES: dict[str, tuple[str | None, str | None]] = {
    "Premier League":   ("eng.1", "ENG-Premier League"),
    "La Liga":          ("esp.1", "ESP-La Liga"),
    "Serie A":          ("ita.1", "ITA-Serie A"),
    "Bundesliga":       ("ger.1", "GER-Bundesliga"),
    "Ligue 1":          ("fra.1", "FRA-Ligue 1"),
    "Champions League": ("uefa.champions", None),
    "Europa League":    ("uefa.europa", None),
    "World Cup":        ("fifa.world", None),
    "Euros":            ("uefa.euro", None),
    "Copa America":     ("conmebol.america", None),
}

def _fold(s: str) -> str:
    """Lowercase, strip accents + punctuation for lookup keys."""
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^a-z0-9 ]+", " ", s.lower())
    s = re.sub(r"\s+", " ", s).strip()
    return s


# alias index with folded keys (accent + punct insensitive)
_ALIAS_TO_CANON: dict[str, str] = {}
for canon, aliases in TEAM_ALIASES.items():
    _ALIAS_TO_CANON[_fold(canon)] = canon
    for a in aliases:
        _ALIAS_TO_CANON[_fold(a)] = canon


def canonical_team(name: str | None) -> str | None:
    """Return the canonical spelling. Unknown names pass through unchanged
    (so we still surface them, just not deduped) — add them to TEAM_ALIASES over time."""
    if not name:
        return None
    key = _fold(name)
    return _ALIAS_TO_CANON.get(key, name)


def canonical_league(name: str | None) -> str | None:
    if not name:
        return None
    return name  # league names are already stable across our sources


def league_sources(name: str) -> tuple[str | None, str | None]:
    return LEAGUE_SOURCES.get(name, (None, None))

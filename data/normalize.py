"""
Entity resolution + the competition registry.

TEAM_ALIASES: one canonical name per team so ESPN and Understat/FBref join cleanly.
The resolver is deliberately conservative: an alias must be an exact case-insensitive
hit after stripping accents/punct. Fuzzy matching would silently mis-join teams.

LEAGUES: every competition we track, with the metadata the pipeline + model need:
  espn / understat  source slugs (understat only exists for the big-5)
  format            'league'      round-robin domestic league (draws stand)
                    'cup'         club knockout cup, home/away legs; final at a neutral site
                    'tournament'  national-team finals tournament, all neutral venues
                    'qualifiers'  national-team qualifying (home/away; occasional one-leg playoffs)
                    'friendly'    international friendlies
  season_style      'cross'    Aug–May European season → label "2026-27"
                    'calendar' calendar-year season (MLS, Liga MX, …) → label "2026"
                    'year'     internationals → label by ESPN's season year
  tier              1 top flight, 2 second division
All ESPN slugs verified against the live scoreboard API (2026-07-17).
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
    "Newcastle United":  ("Newcastle", "Newcastle Utd"),
    "West Ham United":   ("West Ham",),
    "Wolverhampton Wanderers": ("Wolves", "Wolverhampton"),
    "Brighton & Hove Albion": ("Brighton",),
    "AFC Bournemouth":   ("Bournemouth",),
    "Nottingham Forest": ("Nott'm Forest", "Nottm Forest", "Nott'ham Forest"),
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
    "Alavés":            ("Alaves", "Deportivo Alavés", "Deportivo Alaves"),
    # Bundesliga
    "Bayern Munich":     ("Bayern München", "FC Bayern München", "Bayern"),
    "Borussia Dortmund": ("Dortmund", "BVB"),
    "Bayer Leverkusen":  ("Leverkusen",),
    "RB Leipzig":        ("Leipzig", "RasenBallsport Leipzig"),
    "Borussia Mönchengladbach": ("Borussia Monchengladbach", "Gladbach", "M'gladbach", "Borussia M.Gladbach"),
    "1. FC Heidenheim 1846": ("FC Heidenheim", "Heidenheim", "1. FC Heidenheim"),
    "Hamburg SV":        ("Hamburger SV", "Hamburg"),
    "Eintracht Frankfurt": ("Frankfurt", "Eintracht", "Eint Frankfurt"),
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
    "Paris Saint-Germain": ("Paris SG", "PSG", "Paris", "Paris S-G"),
    "Olympique Marseille": ("Marseille",),
    "Olympique Lyonnais":  ("Lyon", "Lyonnais"),
    "AS Monaco":         ("Monaco",),
    "Saint-Étienne":     ("Saint-Etienne", "St Etienne", "St. Etienne"),
    "AJ Auxerre":        ("Auxerre",),
    "Le Havre AC":       ("Le Havre",),
    "Stade Rennais":     ("Rennes", "Stade Rennais FC"),
    # National teams (ESPN uses simple country names)
    "United States":     ("USA", "USMNT", "United States of America"),
    "South Korea":       ("Korea Republic",),
    "North Korea":       ("Korea DPR", "DPR Korea"),
    "Ivory Coast":       ("Côte d'Ivoire", "Cote d'Ivoire"),
}


class League:
    __slots__ = ("name", "espn", "understat", "format", "season_style", "tier")

    def __init__(self, name, espn, understat=None, format="league",
                 season_style="cross", tier=1):
        self.name, self.espn, self.understat = name, espn, understat
        self.format, self.season_style, self.tier = format, season_style, tier


LEAGUES: dict[str, League] = {L.name: L for L in [
    # ---- domestic leagues (the weekly heartbeat) ----
    League("Premier League", "eng.1", "ENG-Premier League"),
    League("La Liga",        "esp.1", "ESP-La Liga"),
    League("Serie A",        "ita.1", "ITA-Serie A"),
    League("Bundesliga",     "ger.1", "GER-Bundesliga"),
    League("Ligue 1",        "fra.1", "FRA-Ligue 1"),
    League("Championship",   "eng.2", tier=2),                     # promotion/relegation pipeline
    League("Primeira Liga",  "por.1"),
    League("Eredivisie",     "ned.1"),
    League("MLS",            "usa.1", season_style="calendar"),
    League("Liga MX",        "mex.1", season_style="calendar"),
    League("Categoría Primera A", "col.1", season_style="calendar"),
    # ---- club cups (how leagues connect across borders) ----
    League("Champions League",  "uefa.champions",       format="cup"),
    League("Europa League",     "uefa.europa",          format="cup"),
    League("Copa Libertadores", "conmebol.libertadores", format="cup", season_style="calendar"),
    # ---- national-team finals tournaments ----
    League("World Cup",    "fifa.world",       format="tournament", season_style="year"),
    League("Euros",        "uefa.euro",        format="tournament", season_style="year"),
    League("Copa America", "conmebol.america", format="tournament", season_style="year"),
    League("Africa Cup of Nations", "caf.nations",    format="tournament", season_style="year"),
    League("Gold Cup",     "concacaf.gold",    format="tournament", season_style="year"),
    # ---- the road to 2030: qualifiers + Nations League + friendlies ----
    League("WC Qualifying — UEFA",     "fifa.worldq.uefa",     format="qualifiers", season_style="year"),
    League("WC Qualifying — CONMEBOL", "fifa.worldq.conmebol", format="qualifiers", season_style="year"),
    League("WC Qualifying — CONCACAF", "fifa.worldq.concacaf", format="qualifiers", season_style="year"),
    League("WC Qualifying — AFC",      "fifa.worldq.afc",      format="qualifiers", season_style="year"),
    League("WC Qualifying — CAF",      "fifa.worldq.caf",      format="qualifiers", season_style="year"),
    League("WC Qualifying — OFC",      "fifa.worldq.ofc",      format="qualifiers", season_style="year"),
    League("UEFA Nations League",      "uefa.nations",         format="qualifiers", season_style="year"),
    League("Int. Friendlies",          "fifa.friendly",        format="friendly",   season_style="year"),
]}

# Back-compat shim: canonical name -> (espn_slug, understat_slug)
LEAGUE_SOURCES: dict[str, tuple[str | None, str | None]] = {
    name: (L.espn, L.understat) for name, L in LEAGUES.items()
}

# ESPN season.slug values that mean "this match cannot end in a draw".
_KNOCKOUT_RE = re.compile(
    r"(final|semifinal|quarterfinal|round-of|knockout|playoff|3rd-place|third-place)",
    re.IGNORECASE,
)
# ...except these, which are group/league formats that merely contain a keyword
_KNOCKOUT_EXCEPTIONS = re.compile(r"(third-round|first-round|second-round|fourth-round)", re.IGNORECASE)


def is_knockout_phase(league_format: str | None, phase: str | None) -> bool:
    """Does this match go to extra time / penalties if level?
    Club cups ('cup') play two-legged knockout rounds where the single match can
    draw — only the final is a one-off, so only the final gets the cascade."""
    if not phase:
        return False
    if _KNOCKOUT_EXCEPTIONS.search(phase) and "playoff" not in phase.lower():
        return False
    if not _KNOCKOUT_RE.search(phase):
        return False
    if league_format == "cup":
        return "final" in phase.lower() and "semifinal" not in phase.lower() \
               and "quarterfinal" not in phase.lower()
    return True


def is_neutral(league_format: str | None, phase: str | None) -> bool:
    """No home advantage? True for finals-tournament matches (WC/Euros/…) and for
    club-cup finals. Qualifiers and friendlies keep home advantage."""
    if league_format == "tournament":
        return True
    if league_format == "cup" and phase and "final" in phase.lower() \
            and "semifinal" not in phase.lower() and "quarterfinal" not in phase.lower():
        return True
    return False


def season_label(league_format: str | None, season_style: str | None,
                 season_year: int | None, kickoff_iso: str | None) -> str | None:
    """Human season label: '2026-27' for cross-year club seasons, '2026' otherwise.
    Uses ESPN's season.year when available, else derives from the kickoff date."""
    y = season_year
    if y is None and kickoff_iso and len(kickoff_iso) >= 7:
        try:
            yy, mm = int(kickoff_iso[:4]), int(kickoff_iso[5:7])
        except ValueError:
            return None
        if season_style == "cross":
            y = yy if mm >= 7 else yy - 1
        else:
            y = yy
    if y is None:
        return None
    if season_style == "cross":
        return f"{y}-{(y + 1) % 100:02d}"
    return str(y)


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

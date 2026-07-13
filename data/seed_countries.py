"""
Seed the countries table + link national teams and league home countries.
Idempotent — safe to re-run (part of `python -m data.pipeline seed`).

Covers the footballing countries the product actually surfaces: WC 2026
participants, the big-5 league nations, and major UEFA/CONMEBOL sides.
"""
from __future__ import annotations

from data import db

# (name, fifa_code, confederation)
COUNTRIES: list[tuple[str, str, str]] = [
    # big-5 league nations
    ("England", "ENG", "UEFA"), ("Spain", "ESP", "UEFA"), ("Italy", "ITA", "UEFA"),
    ("Germany", "GER", "UEFA"), ("France", "FRA", "UEFA"),
    # UEFA
    ("Portugal", "POR", "UEFA"), ("Netherlands", "NED", "UEFA"), ("Belgium", "BEL", "UEFA"),
    ("Croatia", "CRO", "UEFA"), ("Switzerland", "SUI", "UEFA"), ("Austria", "AUT", "UEFA"),
    ("Denmark", "DEN", "UEFA"), ("Norway", "NOR", "UEFA"), ("Sweden", "SWE", "UEFA"),
    ("Poland", "POL", "UEFA"), ("Ukraine", "UKR", "UEFA"), ("Türkiye", "TUR", "UEFA"),
    ("Scotland", "SCO", "UEFA"), ("Wales", "WAL", "UEFA"), ("Ireland", "IRL", "UEFA"),
    ("Serbia", "SRB", "UEFA"), ("Czechia", "CZE", "UEFA"), ("Greece", "GRE", "UEFA"),
    ("Hungary", "HUN", "UEFA"), ("Romania", "ROU", "UEFA"), ("Slovakia", "SVK", "UEFA"),
    ("Slovenia", "SVN", "UEFA"), ("Albania", "ALB", "UEFA"), ("Georgia", "GEO", "UEFA"),
    # CONMEBOL
    ("Argentina", "ARG", "CONMEBOL"), ("Brazil", "BRA", "CONMEBOL"),
    ("Colombia", "COL", "CONMEBOL"), ("Uruguay", "URU", "CONMEBOL"),
    ("Ecuador", "ECU", "CONMEBOL"), ("Chile", "CHI", "CONMEBOL"),
    ("Peru", "PER", "CONMEBOL"), ("Paraguay", "PAR", "CONMEBOL"),
    ("Venezuela", "VEN", "CONMEBOL"), ("Bolivia", "BOL", "CONMEBOL"),
    # CONCACAF
    ("United States", "USA", "CONCACAF"), ("Mexico", "MEX", "CONCACAF"),
    ("Canada", "CAN", "CONCACAF"), ("Costa Rica", "CRC", "CONCACAF"),
    ("Panama", "PAN", "CONCACAF"), ("Jamaica", "JAM", "CONCACAF"),
    ("Honduras", "HON", "CONCACAF"), ("Haiti", "HAI", "CONCACAF"),
    ("Curaçao", "CUW", "CONCACAF"),
    # AFC
    ("Japan", "JPN", "AFC"), ("South Korea", "KOR", "AFC"), ("Australia", "AUS", "AFC"),
    ("Iran", "IRN", "AFC"), ("Saudi Arabia", "KSA", "AFC"), ("Qatar", "QAT", "AFC"),
    ("Uzbekistan", "UZB", "AFC"), ("Jordan", "JOR", "AFC"), ("Iraq", "IRQ", "AFC"),
    # CAF
    ("Morocco", "MAR", "CAF"), ("Senegal", "SEN", "CAF"), ("Nigeria", "NGA", "CAF"),
    ("Egypt", "EGY", "CAF"), ("Ghana", "GHA", "CAF"), ("Cameroon", "CMR", "CAF"),
    ("Ivory Coast", "CIV", "CAF"), ("Algeria", "ALG", "CAF"), ("Tunisia", "TUN", "CAF"),
    ("South Africa", "RSA", "CAF"), ("Cape Verde", "CPV", "CAF"),
    # OFC
    ("New Zealand", "NZL", "OFC"),
]

# league -> home country (for leagues.country_id)
LEAGUE_COUNTRY = {
    "Premier League": "England",
    "La Liga": "Spain",
    "Serie A": "Italy",
    "Bundesliga": "Germany",
    "Ligue 1": "France",
}


def seed_countries() -> None:
    ids: dict[str, int] = {}
    for name, fifa, conf in COUNTRIES:
        ids[name] = db.get_or_create_country(name, fifa_code=fifa, confederation=conf)
    print(f"[seed] countries ensured: {len(ids)}")

    # link national teams by exact name match (WC ingest creates teams named
    # after their country) — also flag them is_national
    linked = 0
    for t in db.page_all("teams", "id,name,country_id,is_national"):
        cid = ids.get(t["name"])
        if cid and (t.get("country_id") != cid or not t.get("is_national")):
            db.client().table("teams").update(
                {"country_id": cid, "is_national": True}
            ).eq("id", t["id"]).execute()
            linked += 1
    print(f"[seed] national teams linked: {linked}")

    # stamp league home countries
    for league, country in LEAGUE_COUNTRY.items():
        hits = db.select("leagues", "id,country_id", name=league)
        if hits and hits[0].get("country_id") != ids[country]:
            db.client().table("leagues").update(
                {"country_id": ids[country]}
            ).eq("id", hits[0]["id"]).execute()
    print("[seed] league home countries stamped")


if __name__ == "__main__":
    seed_countries()

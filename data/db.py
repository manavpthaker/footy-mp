"""
Supabase helper — thin wrapper around the Python client for footy-mp ETL.

Env:
  SUPABASE_URL           https://<ref>.supabase.co
  SUPABASE_SERVICE_KEY   service_role JWT (server-only; bypasses RLS)

Everything here is idempotent: upserts key on our natural keys (espn_event_id,
(name, league_id) for teams, etc.) so re-running the pipeline never duplicates.
"""
from __future__ import annotations

import os
from functools import lru_cache
from typing import Iterable

from supabase import Client, create_client


@lru_cache(maxsize=1)
def client() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in the environment."
        )
    return create_client(url, key)


# ---------- generic helpers ----------

def _rows(res) -> list[dict]:
    return getattr(res, "data", None) or []


def upsert(table: str, rows: list[dict], on_conflict: str | None = None) -> list[dict]:
    if not rows:
        return []
    q = client().table(table).upsert(rows, on_conflict=on_conflict) if on_conflict \
        else client().table(table).upsert(rows)
    return _rows(q.execute())


def select(table: str, columns: str = "*", **filters) -> list[dict]:
    q = client().table(table).select(columns)
    for k, v in filters.items():
        q = q.eq(k, v)
    return _rows(q.execute())


# ---------- entity lookups / creates (used for name -> id resolution) ----------

def get_or_create_country(name: str, fifa_code: str | None = None,
                          confederation: str | None = None) -> int:
    hits = select("countries", "id,name", name=name)
    if hits:
        return hits[0]["id"]
    row = {"name": name}
    if fifa_code: row["fifa_code"] = fifa_code
    if confederation: row["confederation"] = confederation
    r = upsert("countries", [row], on_conflict="name")
    return r[0]["id"] if r else select("countries", "id", name=name)[0]["id"]


def get_or_create_league(name: str, country_id: int | None = None,
                         espn_slug: str | None = None, understat_slug: str | None = None,
                         is_international: bool = False, tier: int = 1) -> int:
    q = client().table("leagues").select("id,name,country_id").eq("name", name)
    if country_id is not None:
        q = q.eq("country_id", country_id)
    hits = _rows(q.execute())
    if hits:
        # patch slugs if missing
        patch = {}
        if espn_slug: patch["espn_slug"] = espn_slug
        if understat_slug: patch["understat_slug"] = understat_slug
        if patch:
            client().table("leagues").update(patch).eq("id", hits[0]["id"]).execute()
        return hits[0]["id"]
    row = {
        "name": name, "country_id": country_id, "espn_slug": espn_slug,
        "understat_slug": understat_slug, "tier": tier, "is_international": is_international,
    }
    r = _rows(client().table("leagues").insert(row).execute())
    return r[0]["id"]


def get_or_create_team(name: str, league_id: int | None = None,
                       country_id: int | None = None, espn_id: str | None = None,
                       fbref_id: str | None = None, is_national: bool = False,
                       short_name: str | None = None) -> int:
    # match on (name, league_id) — matches the schema unique constraint
    q = client().table("teams").select("id,espn_id,fbref_id,league_id").eq("name", name)
    if league_id is not None:
        q = q.eq("league_id", league_id)
    hits = _rows(q.execute())
    if hits:
        patch = {}
        if espn_id and not hits[0].get("espn_id"): patch["espn_id"] = espn_id
        if fbref_id and not hits[0].get("fbref_id"): patch["fbref_id"] = fbref_id
        if country_id: patch["country_id"] = country_id
        if patch:
            client().table("teams").update(patch).eq("id", hits[0]["id"]).execute()
        return hits[0]["id"]
    row = {
        "name": name, "league_id": league_id, "country_id": country_id,
        "espn_id": espn_id, "fbref_id": fbref_id, "is_national": is_national,
        "short_name": short_name,
    }
    r = _rows(client().table("teams").insert(row).execute())
    return r[0]["id"]


def get_or_create_player(name: str, team_id: int | None = None,
                         country_id: int | None = None, position: str | None = None,
                         fbref_id: str | None = None, understat_id: str | None = None) -> int:
    q = client().table("players").select("id").eq("name", name)
    if team_id is not None:
        q = q.eq("team_id", team_id)
    hits = _rows(q.execute())
    if hits:
        return hits[0]["id"]
    row = {
        "name": name, "team_id": team_id, "country_id": country_id,
        "position": position, "fbref_id": fbref_id, "understat_id": understat_id,
    }
    r = _rows(client().table("players").insert(row).execute())
    return r[0]["id"]


# ---------- match upserts ----------

def upsert_matches(rows: list[dict]) -> list[dict]:
    """Upsert on espn_event_id when present, else insert. Rows already resolved
    to team_id/league_id integers."""
    with_ev = [r for r in rows if r.get("espn_event_id")]
    without = [r for r in rows if not r.get("espn_event_id")]
    out = []
    if with_ev:
        out += upsert("matches", with_ev, on_conflict="espn_event_id")
    if without:
        # no natural key — try league+home+away+date match first
        for r in without:
            hits = _rows(
                client().table("matches").select("id")
                .eq("league_id", r["league_id"]).eq("home_team_id", r["home_team_id"])
                .eq("away_team_id", r["away_team_id"]).eq("kickoff_utc", r["kickoff_utc"])
                .execute()
            )
            if hits:
                client().table("matches").update(r).eq("id", hits[0]["id"]).execute()
                out.append({**r, "id": hits[0]["id"]})
            else:
                ins = _rows(client().table("matches").insert(r).execute())
                out += ins
    return out


def upsert_team_match_stats(rows: list[dict]) -> None:
    if rows:
        upsert("team_match_stats", rows, on_conflict="match_id,team_id")


def upsert_player_match_stats(rows: list[dict]) -> None:
    if rows:
        upsert("player_match_stats", rows, on_conflict="match_id,player_id")


# ---------- follows ----------

def add_follow(entity_type: str, entity_id: int, user_id: str = "mp") -> None:
    upsert(
        "follows",
        [{"user_id": user_id, "entity_type": entity_type, "entity_id": entity_id}],
        on_conflict="user_id,entity_type,entity_id",
    )

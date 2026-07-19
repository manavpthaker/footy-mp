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
from datetime import date, timedelta
from functools import lru_cache
from typing import Iterable

from supabase import Client, create_client


@lru_cache(maxsize=1)
def client() -> Client:
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = (
        os.environ.get("SUPABASE_SERVICE_KEY")
        or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        or os.environ.get("SUPABASE_SECRET_KEY")  # new-style Supabase secret name
    )
    if not url or not key:
        raise RuntimeError(
            "SUPABASE_URL and a service/secret key (SUPABASE_SERVICE_KEY, "
            "SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_SECRET_KEY) must be set."
        )
    return create_client(url, key)


# ---------- generic helpers ----------

def _rows(res) -> list[dict]:
    return getattr(res, "data", None) or []


_BACKBONE: bool | None = None


def has_backbone() -> bool:
    """True once migration 002 (matches.phase / leagues.format / movements) is
    applied. Lets the pipeline run against a pre-migration DB without erroring."""
    global _BACKBONE
    if _BACKBONE is None:
        try:
            client().table("matches").select("phase").limit(1).execute()
            _BACKBONE = True
        except Exception:
            print("[db] migration 002 not applied yet — writing legacy columns only")
            _BACKBONE = False
    return _BACKBONE


_V2_MATCH_KEYS = ("phase", "is_knockout", "season")


def _strip_v2(rows: list[dict]) -> list[dict]:
    if has_backbone():
        return rows
    return [{k: v for k, v in r.items() if k not in _V2_MATCH_KEYS} for r in rows]


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


def page_all(table: str, columns: str = "*", page: int = 1000, **filters) -> list[dict]:
    """select() that pages past PostgREST's 1000-row cap."""
    out: list[dict] = []
    start = 0
    while True:
        q = client().table(table).select(columns)
        for k, v in filters.items():
            q = q.eq(k, v)
        chunk = _rows(q.range(start, start + page - 1).execute())
        out += chunk
        if len(chunk) < page:
            return out
        start += page


def find_team(name: str, league_id: int | None = None) -> int | None:
    """Lookup-only team resolution (never creates — ingest sources that can't be
    trusted to name teams canonically should skip rather than spawn dupes)."""
    q = client().table("teams").select("id").eq("name", name)
    if league_id is not None:
        q = q.eq("league_id", league_id)
    hits = _rows(q.execute())
    return hits[0]["id"] if hits else None


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
                         is_international: bool = False, tier: int = 1,
                         format: str | None = None) -> int:
    q = client().table("leagues").select("id,name,country_id").eq("name", name)
    if country_id is not None:
        q = q.eq("country_id", country_id)
    hits = _rows(q.execute())
    if hits:
        # patch slugs / format if missing or drifted
        patch = {}
        if espn_slug: patch["espn_slug"] = espn_slug
        if understat_slug: patch["understat_slug"] = understat_slug
        if format and has_backbone(): patch["format"] = format
        if patch:
            client().table("leagues").update(patch).eq("id", hits[0]["id"]).execute()
        return hits[0]["id"]
    row = {
        "name": name, "country_id": country_id, "espn_slug": espn_slug,
        "understat_slug": understat_slug, "tier": tier, "is_international": is_international,
    }
    if format and has_backbone():
        row["format"] = format
    r = _rows(client().table("leagues").insert(row).execute())
    return r[0]["id"]


@lru_cache(maxsize=1)
def _league_formats() -> dict[int, str]:
    cols = "id,format" if has_backbone() else "id"
    return {l["id"]: l.get("format") or "league"
            for l in _rows(client().table("leagues").select(cols).execute())}


def log_movement(kind: str, *, player_id: int | None = None, team_id: int | None = None,
                 from_team_id: int | None = None, to_team_id: int | None = None,
                 from_league_id: int | None = None, to_league_id: int | None = None,
                 note: str | None = None) -> None:
    """Record a transfer / promotion-relegation event — the 'how things move' feed."""
    if not has_backbone():
        return
    try:
        client().table("movements").insert({
            "kind": kind, "player_id": player_id, "team_id": team_id,
            "from_team_id": from_team_id, "to_team_id": to_team_id,
            "from_league_id": from_league_id, "to_league_id": to_league_id,
            "note": note,
        }).execute()
    except Exception as e:
        print(f"[db] movement log failed (non-fatal): {e}")


def get_or_create_team(name: str, league_id: int | None = None,
                       country_id: int | None = None, espn_id: str | None = None,
                       fbref_id: str | None = None, is_national: bool = False,
                       short_name: str | None = None,
                       league_format: str | None = None,
                       crest_url: str | None = None) -> int:
    """One row per real-world team, forever.

    Identity: espn_id first (global natural key), then name (global — a club that
    shows up in the Champions League is the same club that plays in its league).
    league_id records a club's DOMESTIC home only: cup/tournament appearances never
    reassign it, and a genuine domestic move (promotion/relegation) updates it in
    place and logs a movement instead of forking a second row."""
    espn_id = (espn_id or "").strip() or None
    hits = []
    if espn_id:
        hits = _rows(client().table("teams")
                     .select("id,espn_id,fbref_id,league_id,is_national,crest_url").eq("espn_id", espn_id).execute())
    if not hits:
        q = client().table("teams").select("id,espn_id,fbref_id,league_id,is_national,crest_url").eq("name", name)
        hits = _rows(q.execute())
        # never adopt a different club that happens to share the name: if the hit
        # has a conflicting espn_id, treat as a distinct team
        if hits and espn_id and hits[0].get("espn_id") and hits[0]["espn_id"] != espn_id:
            hits = []

    national = is_national or league_format in ("tournament", "qualifiers", "friendly")

    if hits:
        t = hits[0]
        patch = {}
        if espn_id and not t.get("espn_id"): patch["espn_id"] = espn_id
        if fbref_id and not t.get("fbref_id"): patch["fbref_id"] = fbref_id
        if crest_url and not t.get("crest_url"): patch["crest_url"] = crest_url
        if country_id: patch["country_id"] = country_id
        if national and not t.get("is_national"): patch["is_national"] = True
        # domestic home changes only on league->league moves (promotion/relegation)
        if (league_id is not None and league_format == "league"
                and not t.get("is_national") and not national):
            old = t.get("league_id")
            if old is None:
                patch["league_id"] = league_id
            elif old != league_id and _league_formats().get(old) == "league":
                patch["league_id"] = league_id
                log_movement("league_change", team_id=t["id"],
                             from_league_id=old, to_league_id=league_id,
                             note=f"{name}: domestic league change")
        if patch:
            client().table("teams").update(patch).eq("id", t["id"]).execute()
        return t["id"]

    row = {
        "name": name,
        "league_id": league_id if (league_format in (None, "league") and not national) else None,
        "country_id": country_id,
        "espn_id": espn_id, "fbref_id": fbref_id, "is_national": national,
        "short_name": short_name, "crest_url": crest_url,
    }
    r = _rows(client().table("teams").insert(row).execute())
    return r[0]["id"]


def get_or_create_player(name: str, team_id: int | None = None,
                         country_id: int | None = None, position: str | None = None,
                         fbref_id: str | None = None, understat_id: str | None = None,
                         dob: str | None = None, photo_url: str | None = None) -> int:
    """One row per real-world player, forever.

    Identity: understat_id first, then name (global). A club change updates
    team_id in place and logs a transfer movement — it never forks a second row.
    Guard: a name hit whose recorded country conflicts with the incoming one is
    treated as a different person."""
    hits = []
    if understat_id:
        hits = _rows(client().table("players")
                     .select("id,team_id,country_id,position,dob,photo_url,understat_id")
                     .eq("understat_id", understat_id).execute())
    if not hits:
        cand = _rows(client().table("players")
                     .select("id,team_id,country_id,position,dob,photo_url,understat_id")
                     .eq("name", name).execute())
        if cand and country_id:
            same = [p for p in cand if not p.get("country_id") or p["country_id"] == country_id]
            cand = same or []
        if cand and team_id:
            cand.sort(key=lambda p: 0 if p.get("team_id") == team_id else 1)
        hits = cand[:1]

    if hits:
        p = hits[0]
        patch = {}
        if country_id and not p.get("country_id"): patch["country_id"] = country_id
        if position and not p.get("position"): patch["position"] = position
        if dob and not p.get("dob"): patch["dob"] = dob
        if photo_url and not p.get("photo_url"): patch["photo_url"] = photo_url
        if understat_id and not p.get("understat_id"): patch["understat_id"] = understat_id
        if team_id and p.get("team_id") and p["team_id"] != team_id:
            patch["team_id"] = team_id
            log_movement("transfer", player_id=p["id"],
                         from_team_id=p["team_id"], to_team_id=team_id,
                         note=f"{name}: club change")
        elif team_id and not p.get("team_id"):
            patch["team_id"] = team_id
        if patch:
            client().table("players").update(patch).eq("id", p["id"]).execute()
        return p["id"]

    row = {
        "name": name, "team_id": team_id, "country_id": country_id,
        "position": position, "fbref_id": fbref_id, "understat_id": understat_id,
    }
    if dob: row["dob"] = dob
    if photo_url: row["photo_url"] = photo_url
    r = _rows(client().table("players").insert(row).execute())
    return r[0]["id"]


# ---------- match upserts ----------

def _claim_placeholder(r: dict) -> dict | None:
    """Find an Understat-created placeholder for this ESPN row — same league and
    teams within ±1 day, no espn_event_id — and update it in place (ESPN wins on
    kickoff/status). Returns the claimed row, or None if no placeholder exists."""
    day = (r.get("kickoff_utc") or "")[:10]
    if not day:
        return None
    d = date.fromisoformat(day)
    lo = f"{d - timedelta(days=1)}T00:00:00Z"
    hi = f"{d + timedelta(days=1)}T23:59:59Z"
    hits = _rows(
        client().table("matches").select("id")
        .eq("league_id", r["league_id"]).eq("home_team_id", r["home_team_id"])
        .eq("away_team_id", r["away_team_id"]).is_("espn_event_id", "null")
        .gte("kickoff_utc", lo).lte("kickoff_utc", hi).limit(1).execute()
    )
    if not hits:
        return None
    client().table("matches").update(r).eq("id", hits[0]["id"]).execute()
    return {**r, "id": hits[0]["id"]}


def upsert_matches(rows: list[dict]) -> list[dict]:
    """Upsert on espn_event_id when present, else insert. Rows already resolved
    to team_id/league_id integers. ESPN rows not yet in the table first try to
    claim an Understat placeholder so the two sources never duplicate a match."""
    rows = _strip_v2(rows)
    with_ev = [r for r in rows if r.get("espn_event_id")]
    without = [r for r in rows if not r.get("espn_event_id")]
    out = []
    if with_ev:
        known = {
            h["espn_event_id"] for h in _rows(
                client().table("matches").select("espn_event_id")
                .in_("espn_event_id", [r["espn_event_id"] for r in with_ev]).execute()
            )
        }
        to_upsert = []
        for r in with_ev:
            if r["espn_event_id"] not in known:
                claimed = _claim_placeholder(r)
                if claimed is not None:
                    out.append(claimed)
                    continue
            to_upsert.append(r)
        if to_upsert:
            out += upsert("matches", to_upsert, on_conflict="espn_event_id")
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

/**
 * Server-side reads over Supabase for the dashboard + entity pages.
 * All functions are called from server components — they await server() to
 * get a cookie-aware @supabase/ssr client.
 */
import { server, Team, Player, League, Country, Match, Movement, Prediction, Follow, ModelRating, EntityType } from "./supabase";

export const USER_ID = "mp";
export const MODEL_VERSION = "footy-mp-v2";

// ---------- Follows ----------

export async function listFollows(): Promise<Follow[]> {
  const s = await server();
  const { data } = await s.from("follows").select("*").eq("user_id", USER_ID);
  return (data ?? []) as Follow[];
}

export async function loadFollowedEntities(): Promise<{
  players: Player[]; teams: Team[]; leagues: League[]; countries: Country[];
}> {
  const [follows, s] = await Promise.all([listFollows(), server()]);
  const groups: Record<EntityType, number[]> = {
    player: [], team: [], league: [], country: [],
  };
  for (const f of follows) groups[f.entity_type].push(f.entity_id);

  const [players, teams, leagues, countries] = await Promise.all([
    groups.player.length
      ? s.from("players").select("*").in("id", groups.player).then(r => (r.data ?? []) as Player[])
      : Promise.resolve([]),
    groups.team.length
      ? s.from("teams").select("*").in("id", groups.team).then(r => (r.data ?? []) as Team[])
      : Promise.resolve([]),
    groups.league.length
      ? s.from("leagues").select("*").in("id", groups.league).then(r => (r.data ?? []) as League[])
      : Promise.resolve([]),
    groups.country.length
      ? s.from("countries").select("*").in("id", groups.country).then(r => (r.data ?? []) as Country[])
      : Promise.resolve([]),
  ]);
  return { players, teams, leagues, countries };
}

// ---------- Matches ----------

export interface RichMatch extends Match {
  home_team?: Team;
  away_team?: Team;
  league?: League;
  prediction?: Prediction;
}

export async function upcomingForTeams(teamIds: number[], limit = 20): Promise<RichMatch[]> {
  if (!teamIds.length) return [];
  const s = await server();
  const { data } = await s
    .from("matches")
    .select("*")
    .in("status", ["scheduled", "live"])
    .gte("kickoff_utc", new Date(Date.now() - 3 * 3600_000).toISOString())
    .or(teamIds.map(id => `home_team_id.eq.${id},away_team_id.eq.${id}`).join(","))
    .order("kickoff_utc", { ascending: true })
    .limit(limit);
  return enrich((data ?? []) as Match[]);
}

export async function recentResultsForTeams(teamIds: number[], limit = 20): Promise<RichMatch[]> {
  if (!teamIds.length) return [];
  const s = await server();
  const { data } = await s
    .from("matches")
    .select("*")
    .eq("status", "final")
    .or(teamIds.map(id => `home_team_id.eq.${id},away_team_id.eq.${id}`).join(","))
    .order("kickoff_utc", { ascending: false })
    .limit(limit);
  return enrich((data ?? []) as Match[]);
}

export async function fixturesForLeague(leagueId: number, days = 14): Promise<RichMatch[]> {
  const start = new Date(Date.now() - 24 * 3600_000).toISOString();
  const end = new Date(Date.now() + days * 24 * 3600_000).toISOString();
  const s = await server();
  const { data } = await s
    .from("matches")
    .select("*")
    .eq("league_id", leagueId)
    .gte("kickoff_utc", start)
    .lte("kickoff_utc", end)
    .order("kickoff_utc", { ascending: true });
  return enrich((data ?? []) as Match[]);
}

export async function resultsForLeague(leagueId: number, limit = 20): Promise<RichMatch[]> {
  const s = await server();
  const { data } = await s
    .from("matches")
    .select("*")
    .eq("league_id", leagueId)
    .eq("status", "final")
    .order("kickoff_utc", { ascending: false })
    .limit(limit);
  return enrich((data ?? []) as Match[]);
}

async function enrich(matches: Match[]): Promise<RichMatch[]> {
  if (!matches.length) return [];
  const teamIds = Array.from(new Set(matches.flatMap(m => [m.home_team_id, m.away_team_id])));
  const leagueIds = Array.from(new Set(matches.map(m => m.league_id).filter((x): x is number => x !== null)));
  const matchIds = matches.map(m => m.id);
  const s = await server();
  const [teams, leagues, preds] = await Promise.all([
    s.from("teams").select("*").in("id", teamIds).then(r => (r.data ?? []) as Team[]),
    leagueIds.length
      ? s.from("leagues").select("*").in("id", leagueIds).then(r => (r.data ?? []) as League[])
      : Promise.resolve([]),
    s.from("predictions").select("*").in("match_id", matchIds).eq("model_version", MODEL_VERSION)
      .then(r => (r.data ?? []) as Prediction[]),
  ]);
  const tById = new Map(teams.map(t => [t.id, t]));
  const lById = new Map(leagues.map(l => [l.id, l]));
  const pById = new Map(preds.map(p => [p.match_id, p]));
  return matches.map(m => ({
    ...m,
    home_team: tById.get(m.home_team_id),
    away_team: tById.get(m.away_team_id),
    league: m.league_id ? lById.get(m.league_id) : undefined,
    prediction: pById.get(m.id),
  }));
}

// ---------- Entity page loaders ----------

export async function getTeam(id: number): Promise<Team | null> {
  const s = await server();
  const { data } = await s.from("teams").select("*").eq("id", id).maybeSingle();
  return (data ?? null) as Team | null;
}
export async function getPlayer(id: number): Promise<Player | null> {
  const s = await server();
  const { data } = await s.from("players").select("*").eq("id", id).maybeSingle();
  return (data ?? null) as Player | null;
}
export async function getLeague(id: number): Promise<League | null> {
  const s = await server();
  const { data } = await s.from("leagues").select("*").eq("id", id).maybeSingle();
  return (data ?? null) as League | null;
}
export async function getCountry(id: number): Promise<Country | null> {
  const s = await server();
  const { data } = await s.from("countries").select("*").eq("id", id).maybeSingle();
  return (data ?? null) as Country | null;
}

// ---------- The Lowdown ----------

export interface Lowdown {
  match_id: number;
  version: string;
  state: "pre" | "live" | "post";
  paragraphs: string[];
  verdict: string | null;
  generated_at: string;
}

export const LOWDOWN_VERSION = "lowdown-v1";

export async function getLowdown(matchId: number): Promise<Lowdown | null> {
  const s = await server();
  const { data } = await s
    .from("lowdowns").select("*")
    .eq("match_id", matchId).eq("version", LOWDOWN_VERSION)
    .maybeSingle();
  return (data ?? null) as Lowdown | null;
}

export async function nationalTeamForCountry(countryId: number): Promise<Team | null> {
  const s = await server();
  const { data } = await s
    .from("teams").select("*")
    .eq("country_id", countryId).eq("is_national", true)
    .limit(1).maybeSingle();
  return (data ?? null) as Team | null;
}

export async function leaguesForCountry(countryId: number): Promise<League[]> {
  const s = await server();
  const { data } = await s.from("leagues").select("*").eq("country_id", countryId);
  return (data ?? []) as League[];
}

export async function countriesByIds(ids: number[]): Promise<Record<number, Country>> {
  const clean = Array.from(new Set(ids.filter(Boolean)));
  if (!clean.length) return {};
  const s = await server();
  const { data } = await s.from("countries").select("*").in("id", clean);
  return Object.fromEntries(((data ?? []) as Country[]).map(c => [c.id, c]));
}

export async function latestRatingForTeam(id: number): Promise<ModelRating | null> {
  const s = await server();
  const { data } = await s
    .from("model_ratings").select("*")
    .eq("team_id", id).eq("model_version", MODEL_VERSION)
    .order("as_of_date", { ascending: false }).limit(1).maybeSingle();
  return (data ?? null) as ModelRating | null;
}

export async function teamsInLeague(leagueId: number): Promise<Team[]> {
  const s = await server();
  const { data } = await s.from("teams").select("*").eq("league_id", leagueId).order("name");
  return (data ?? []) as Team[];
}

export async function playersOnTeam(teamId: number): Promise<Player[]> {
  const s = await server();
  const { data } = await s.from("players").select("*").eq("team_id", teamId).order("name");
  return (data ?? []) as Player[];
}

// ---------- Extended queries for the mobile app ----------

/** All upcoming matches (scheduled + live), sorted asc. Cap 200 for the list screen. */
export async function upcomingAll(limit = 200): Promise<RichMatch[]> {
  const s = await server();
  const { data } = await s
    .from("matches")
    .select("*")
    .in("status", ["scheduled", "live"])
    .gte("kickoff_utc", new Date(Date.now() - 3 * 3600_000).toISOString())
    .order("kickoff_utc", { ascending: true })
    .limit(limit);
  return enrich((data ?? []) as Match[]);
}

/** Recent results across every league, sorted desc. */
export async function resultsAll(limit = 60): Promise<RichMatch[]> {
  const s = await server();
  const { data } = await s
    .from("matches")
    .select("*")
    .eq("status", "final")
    .order("kickoff_utc", { ascending: false })
    .limit(limit);
  return enrich((data ?? []) as Match[]);
}

/** Live matches only. */
export async function liveMatches(): Promise<RichMatch[]> {
  const s = await server();
  const { data } = await s.from("matches").select("*").eq("status", "live");
  return enrich((data ?? []) as Match[]);
}

export async function getMatch(id: number): Promise<RichMatch | null> {
  const s = await server();
  const { data } = await s.from("matches").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  const rich = await enrich([data as Match]);
  return rich[0] ?? null;
}

/** Last N finished matches for a team, oldest -> newest, W/D/L result for FormPills. */
export async function formLast5(teamId: number): Promise<Array<"W" | "D" | "L">> {
  const s = await server();
  const { data } = await s
    .from("matches")
    .select("*")
    .eq("status", "final")
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order("kickoff_utc", { ascending: false })
    .limit(5);
  const list = (data ?? []) as Match[];
  return list.reverse().map(m => {
    if (m.went_pens && m.pens_home != null && m.pens_away != null) {
      const homeWon = m.pens_home > m.pens_away;
      return (m.home_team_id === teamId ? (homeWon ? "W" : "L") : (homeWon ? "L" : "W"));
    }
    if (m.home_goals == null || m.away_goals == null) return "D";
    if (m.home_goals === m.away_goals) return "D";
    const homeWon = m.home_goals > m.away_goals;
    return (m.home_team_id === teamId ? (homeWon ? "W" : "L") : (homeWon ? "L" : "W"));
  });
}

/** Everything for the League table screen: standings + fixtures/results. */
export interface LeagueTableRow {
  team: string;
  teamId: number;
  flag: string;
  followed: boolean;
  pos: number;
  P: number; W: number; D: number; L: number; GF: number; GA: number; GD: number; Pts: number;
  zone: "ucl" | "uel" | "conf" | "releg" | null;
  form: Array<"W" | "D" | "L">;
}

const ZONE_RULES: Record<string, { ucl?: number; uel?: number; conf?: number; releg?: number }> = {
  "Premier League": { ucl: 4, uel: 5, conf: 6, releg: -3 },
  "La Liga":        { ucl: 4, uel: 5, conf: 6, releg: -3 },
  "Serie A":        { ucl: 4, uel: 5, conf: 6, releg: -3 },
  "Bundesliga":     { ucl: 4, uel: 5, conf: 6, releg: -2 },
  "Ligue 1":        { ucl: 3, uel: 4, conf: 5, releg: -2 },
};

export async function standingsForLeague(leagueId: number): Promise<{ league: League | null; rows: LeagueTableRow[] }> {
  const league = await getLeague(leagueId);
  if (!league) return { league: null, rows: [] };
  const s = await server();
  const [matchesRes, teamsRes, followsRes] = await Promise.all([
    // season-scoped: a table is one season, not the whole match archive
    s.from("matches").select("*").eq("league_id", leagueId).eq("status", "final")
      .gte("kickoff_utc", seasonStartIso()),
    s.from("teams").select("*").eq("league_id", leagueId),
    s.from("follows").select("*").eq("user_id", USER_ID).eq("entity_type", "team"),
  ]);
  const matches = (matchesRes.data ?? []) as Match[];
  const teams = (teamsRes.data ?? []) as Team[];
  const followedIds = new Set((followsRes.data ?? []).map((f: any) => f.entity_id));
  const tById = new Map(teams.map(t => [t.id, t]));

  const stats: Record<number, { W: number; D: number; L: number; GF: number; GA: number; P: number }> = {};
  for (const t of teams) stats[t.id] = { W: 0, D: 0, L: 0, GF: 0, GA: 0, P: 0 };

  for (const m of matches) {
    if (m.home_goals == null || m.away_goals == null) continue;
    const h = stats[m.home_team_id]; const a = stats[m.away_team_id];
    if (!h || !a) continue;
    h.P++; a.P++;
    h.GF += m.home_goals; h.GA += m.away_goals;
    a.GF += m.away_goals; a.GA += m.home_goals;
    if (m.home_goals > m.away_goals) { h.W++; a.L++; }
    else if (m.home_goals < m.away_goals) { h.L++; a.W++; }
    else { h.D++; a.D++; }
  }

  // form from the league matches we already fetched — no per-team round-trips
  const teamIds = Object.keys(stats).map(Number);
  const byDate = [...matches]
    .filter(m => m.home_goals != null && m.away_goals != null)
    .sort((a, b) => (a.kickoff_utc < b.kickoff_utc ? -1 : 1));
  const formByTeam = new Map<number, Array<"W" | "D" | "L">>();
  for (const m of byDate) {
    for (const [tid, gf, ga] of [
      [m.home_team_id, m.home_goals!, m.away_goals!],
      [m.away_team_id, m.away_goals!, m.home_goals!],
    ] as Array<[number, number, number]>) {
      const arr = formByTeam.get(tid) ?? [];
      arr.push(gf > ga ? "W" : gf < ga ? "L" : "D");
      if (arr.length > 5) arr.shift();
      formByTeam.set(tid, arr);
    }
  }

  const rows = teamIds
    .map(id => {
      const st = stats[id];
      const t = tById.get(id)!;
      return {
        team: t.name,
        teamId: id,
        flag: "⚽", // resolved at render time via format.flagFor
        followed: followedIds.has(id),
        pos: 0,
        P: st.P, W: st.W, D: st.D, L: st.L, GF: st.GF, GA: st.GA,
        GD: st.GF - st.GA,
        Pts: 3 * st.W + st.D,
        zone: null as LeagueTableRow["zone"],
        form: formByTeam.get(id) ?? [],
      };
    })
    .filter(r => r.P > 0)
    .sort((a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF);

  const rules = ZONE_RULES[league.name] ?? {};
  const n = rows.length;
  rows.forEach((r, i) => {
    r.pos = i + 1;
    if (rules.ucl && i < rules.ucl) r.zone = "ucl";
    else if (rules.uel && i < rules.uel) r.zone = "uel";
    else if (rules.conf && i < rules.conf) r.zone = "conf";
    else if (rules.releg && i >= n + rules.releg) r.zone = "releg";
  });
  return { league, rows };
}

const FALLBACK_TABLE_LEAGUES = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"];

/** Domestic leagues that can render a table (round-robin formats). */
export async function tableableLeagues(): Promise<League[]> {
  const s = await server();
  const { data } = await s.from("leagues").select("*").order("tier").order("name");
  const all = (data ?? []) as League[];
  const domestic = all.filter(l => (l.format ?? null) === "league");
  const list = domestic.length ? domestic : all.filter(l => FALLBACK_TABLE_LEAGUES.includes(l.name));
  // big-5 first, then the rest alphabetically
  return list.sort((a, b) => {
    const ai = FALLBACK_TABLE_LEAGUES.indexOf(a.name);
    const bi = FALLBACK_TABLE_LEAGUES.indexOf(b.name);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.name.localeCompare(b.name);
  });
}

// ---------- The ecosystem: how clubs, countries, and competitions connect ----------

export interface SquadClubGroup {
  club: Team | null;               // null = club unknown/untracked
  league: League | null;
  players: Player[];
}

/**
 * Where a country's internationals earn their living: the national-team player
 * pool grouped by club, clubs sorted by headcount. The heart of the
 * club↔country web — populated by the weekly rosters ingest.
 */
export async function squadByClub(countryId: number): Promise<SquadClubGroup[]> {
  const s = await server();
  const { data } = await s.from("players").select("*").eq("country_id", countryId).order("name");
  const players = (data ?? []) as Player[];
  if (!players.length) return [];
  const clubIds = Array.from(new Set(players.map(p => p.team_id).filter((x): x is number => x != null)));
  const clubs = clubIds.length
    ? ((await s.from("teams").select("*").in("id", clubIds)).data ?? []) as Team[]
    : [];
  const clubById = new Map(clubs.map(c => [c.id, c]));
  const leagueIds = Array.from(new Set(clubs.map(c => c.league_id).filter((x): x is number => x != null)));
  const leagues = leagueIds.length
    ? ((await s.from("leagues").select("*").in("id", leagueIds)).data ?? []) as League[]
    : [];
  const leagueById = new Map(leagues.map(l => [l.id, l]));

  const groups = new Map<number | 0, SquadClubGroup>();
  for (const p of players) {
    const club = p.team_id ? clubById.get(p.team_id) ?? null : null;
    if (club?.is_national) continue;              // NT rows aren't clubs
    const key = club?.id ?? 0;
    const g = groups.get(key) ?? {
      club,
      league: club?.league_id ? leagueById.get(club.league_id) ?? null : null,
      players: [],
    };
    g.players.push(p);
    groups.set(key, g);
  }
  return Array.from(groups.values()).sort((a, b) =>
    (a.club ? 0 : 1) - (b.club ? 0 : 1) || b.players.length - a.players.length);
}

export interface CountryGroup { country: Country; players: Player[] }

/** A club squad grouped by nationality — which national teams this club feeds. */
export async function squadByNationality(teamId: number): Promise<CountryGroup[]> {
  const s = await server();
  const { data } = await s.from("players").select("*").eq("team_id", teamId).order("name");
  const players = (data ?? []) as Player[];
  const ids = Array.from(new Set(players.map(p => p.country_id).filter((x): x is number => x != null)));
  if (!ids.length) return [];
  const countries = ((await s.from("countries").select("*").in("id", ids)).data ?? []) as Country[];
  const cById = new Map(countries.map(c => [c.id, c]));
  const groups = new Map<number, CountryGroup>();
  for (const p of players) {
    if (!p.country_id) continue;
    const c = cById.get(p.country_id);
    if (!c) continue;
    const g = groups.get(c.id) ?? { country: c, players: [] };
    g.players.push(p);
    groups.set(c.id, g);
  }
  return Array.from(groups.values()).sort((a, b) => b.players.length - a.players.length);
}

export interface RichMovement extends Movement {
  player?: Player | null;
  from_team?: Team | null;
  to_team?: Team | null;
  moved_team?: Team | null;
  from_league?: League | null;
  to_league?: League | null;
}

/** Latest transfers + promotion/relegation the pipeline noticed. */
export async function recentMovements(limit = 12): Promise<RichMovement[]> {
  const s = await server();
  const { data, error } = await s
    .from("movements").select("*")
    .order("noticed_at", { ascending: false }).limit(limit);
  if (error) return [];                            // table lands with migration 002
  const moves = (data ?? []) as Movement[];
  if (!moves.length) return [];
  const playerIds = Array.from(new Set(moves.map(m => m.player_id).filter((x): x is number => x != null)));
  const teamIds = Array.from(new Set(moves.flatMap(m => [m.team_id, m.from_team_id, m.to_team_id])
    .filter((x): x is number => x != null)));
  const leagueIds = Array.from(new Set(moves.flatMap(m => [m.from_league_id, m.to_league_id])
    .filter((x): x is number => x != null)));
  const [players, teams, leagues] = await Promise.all([
    playerIds.length ? s.from("players").select("*").in("id", playerIds).then(r => (r.data ?? []) as Player[]) : [],
    teamIds.length ? s.from("teams").select("*").in("id", teamIds).then(r => (r.data ?? []) as Team[]) : [],
    leagueIds.length ? s.from("leagues").select("*").in("id", leagueIds).then(r => (r.data ?? []) as League[]) : [],
  ]);
  const pById = new Map(players.map(p => [p.id, p]));
  const tById = new Map(teams.map(t => [t.id, t]));
  const lById = new Map(leagues.map(l => [l.id, l]));
  return moves.map(m => ({
    ...m,
    player: m.player_id ? pById.get(m.player_id) ?? null : null,
    moved_team: m.team_id ? tById.get(m.team_id) ?? null : null,
    from_team: m.from_team_id ? tById.get(m.from_team_id) ?? null : null,
    to_team: m.to_team_id ? tById.get(m.to_team_id) ?? null : null,
    from_league: m.from_league_id ? lById.get(m.from_league_id) ?? null : null,
    to_league: m.to_league_id ? lById.get(m.to_league_id) ?? null : null,
  }));
}

export interface CompetitionNext {
  league: League;
  next: Match;
  scheduled: number;               // matches on the books
}

/**
 * What's next in every competition we track — the fuel for "the road to 2030".
 * Grouped later by league.format: qualifiers/tournaments = the international
 * arc; leagues/cups = the weekly club heartbeat.
 */
export async function nextUpByCompetition(): Promise<CompetitionNext[]> {
  const s = await server();
  const horizon = new Date(Date.now() - 3 * 3600_000).toISOString();
  const [matchesRes, leaguesRes] = await Promise.all([
    s.from("matches").select("*").eq("status", "scheduled")
      .gte("kickoff_utc", horizon).order("kickoff_utc", { ascending: true }).limit(600),
    s.from("leagues").select("*"),
  ]);
  const leagues = new Map(((leaguesRes.data ?? []) as League[]).map(l => [l.id, l]));
  const seen = new Map<number, CompetitionNext>();
  for (const m of (matchesRes.data ?? []) as Match[]) {
    if (!m.league_id) continue;
    const league = leagues.get(m.league_id);
    if (!league) continue;
    const cur = seen.get(m.league_id);
    if (cur) cur.scheduled += 1;
    else seen.set(m.league_id, { league, next: m, scheduled: 1 });
  }
  return Array.from(seen.values()).sort((a, b) =>
    (a.next.kickoff_utc < b.next.kickoff_utc ? -1 : 1));
}

/** Prediction + rating helpers per team (used on Team screen). */
export async function factorsForTeam(teamId: number): Promise<Array<{ label: string; z: number }>> {
  // Field-average benchmarks for xG/xGA (approx from our 2-season backfill):
  // avg attack ~ 1.0, avg defense ~ 1.0. Convert (rating - 1)/0.28 -> z.
  const r = await latestRatingForTeam(teamId);
  const form = await formLast5(teamId);
  const attZ = r ? (Number(r.attack ?? 1) - 1) / 0.28 : 0;
  const defZ = r ? (1 - Number(r.defense ?? 1)) / 0.20 : 0; // lower defense is better
  const w = form.filter(x => x === "W").length;
  const l = form.filter(x => x === "L").length;
  const formZ = (w - l) / 3;
  return [
    { label: "ATT XG", z: round2(attZ) },
    { label: "DEF XGA", z: round2(defZ) },
    { label: "FORM", z: round2(formZ) },
    { label: "AVAIL", z: 0 },
  ];
}

function round2(x: number) {
  return Math.round(x * 100) / 100;
}

// ---------- Player match stats (Understat via the ETL) ----------

export interface PlayerAgg {
  matches: number; minutes: number; goals: number; assists: number; xg: number; xa: number;
}

export interface PlayerMatchLine {
  matchId: number;
  date: string;            // YYYY-MM-DD
  opponent: string;
  home: boolean;
  competition?: string;
  minutes: number | null; goals: number | null; assists: number | null;
  xg: number | null; xa: number | null;
}

/** European-season boundary: seasons run Aug -> May. */
export function seasonStartIso(): string {
  const now = new Date();
  const y = now.getUTCMonth() + 1 >= 8 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
  return `${y}-08-01T00:00:00Z`;
}

type PmsRow = {
  match_id: number; player_id: number;
  minutes: number | null; goals: number | null; assists: number | null;
  xg: number | string | null; xa: number | string | null;
};

function emptyAgg(): PlayerAgg {
  return { matches: 0, minutes: 0, goals: 0, assists: 0, xg: 0, xa: 0 };
}

function addRow(agg: PlayerAgg, r: PmsRow) {
  agg.matches += 1;
  agg.minutes += r.minutes ?? 0;
  agg.goals += r.goals ?? 0;
  agg.assists += r.assists ?? 0;
  agg.xg += Number(r.xg ?? 0);
  agg.xa += Number(r.xa ?? 0);
}

/** Current-season totals for a set of players (list rows on Today/Following). */
export async function seasonTotalsForPlayers(playerIds: number[]): Promise<Record<number, PlayerAgg>> {
  if (!playerIds.length) return {};
  const s = await server();
  const { data } = await s.from("player_match_stats").select("*").in("player_id", playerIds);
  const rows = (data ?? []) as PmsRow[];
  if (!rows.length) return {};
  const matchIds = Array.from(new Set(rows.map(r => r.match_id)));
  const kickoff: Record<number, string> = {};
  for (let i = 0; i < matchIds.length; i += 500) {
    const { data: ms } = await s.from("matches").select("id,kickoff_utc").in("id", matchIds.slice(i, i + 500));
    for (const m of (ms ?? []) as Array<{ id: number; kickoff_utc: string }>) kickoff[m.id] = m.kickoff_utc;
  }
  const start = seasonStartIso();
  const out: Record<number, PlayerAgg> = {};
  for (const r of rows) {
    const k = kickoff[r.match_id];
    if (!k || k < start) continue;
    addRow(out[r.player_id] ??= emptyAgg(), r);
  }
  return out;
}

/** Everything the player detail screen needs: season + World Cup totals and a match log. */
export async function playerStatBlocks(playerId: number, logLimit = 10): Promise<{
  season: PlayerAgg | null; worldCup: PlayerAgg | null; log: PlayerMatchLine[];
}> {
  const s = await server();
  const { data } = await s.from("player_match_stats").select("*").eq("player_id", playerId);
  const rows = (data ?? []) as Array<PmsRow & { team_id: number | null }>;
  if (!rows.length) return { season: null, worldCup: null, log: [] };

  const matchIds = Array.from(new Set(rows.map(r => r.match_id)));
  const matches: Record<number, Match> = {};
  for (let i = 0; i < matchIds.length; i += 500) {
    const { data: ms } = await s.from("matches").select("*").in("id", matchIds.slice(i, i + 500));
    for (const m of (ms ?? []) as Match[]) matches[m.id] = m;
  }
  const teamIds = Array.from(new Set(
    Object.values(matches).flatMap(m => [m.home_team_id, m.away_team_id])));
  const leagueIds = Array.from(new Set(
    Object.values(matches).map(m => m.league_id).filter((x): x is number => x !== null)));
  const [teamsRes, leaguesRes] = await Promise.all([
    s.from("teams").select("id,name").in("id", teamIds),
    leagueIds.length ? s.from("leagues").select("id,name").in("id", leagueIds) : Promise.resolve({ data: [] }),
  ]);
  const teamName = new Map((teamsRes.data ?? []).map((t: any) => [t.id as number, t.name as string]));
  const leagueName = new Map(((leaguesRes.data ?? []) as any[]).map(l => [l.id as number, l.name as string]));

  const start = seasonStartIso();
  const season = emptyAgg();
  const worldCup = emptyAgg();
  const lines: PlayerMatchLine[] = [];
  for (const r of rows) {
    const m = matches[r.match_id];
    if (!m) continue;
    const comp = m.league_id ? leagueName.get(m.league_id) : undefined;
    if (comp === "World Cup") addRow(worldCup, r);
    if ((m.kickoff_utc ?? "") >= start) addRow(season, r);
    const home = r.team_id != null ? m.home_team_id === r.team_id : false;
    lines.push({
      matchId: m.id,
      date: (m.kickoff_utc ?? "").slice(0, 10),
      opponent: teamName.get(home ? m.away_team_id : m.home_team_id) ?? "—",
      home,
      competition: comp,
      minutes: r.minutes, goals: r.goals, assists: r.assists,
      xg: r.xg == null ? null : Number(r.xg), xa: r.xa == null ? null : Number(r.xa),
    });
  }
  lines.sort((a, b) => (a.date < b.date ? 1 : -1));
  return {
    season: season.matches ? season : null,
    worldCup: worldCup.matches ? worldCup : null,
    log: lines.slice(0, logLimit),
  };
}

/** Top players on a team this season by goal involvement (for the squad "key" badge). */
export async function keyPlayerIds(teamId: number, top = 2): Promise<number[]> {
  const s = await server();
  const { data } = await s.from("player_match_stats").select("*").eq("team_id", teamId);
  const rows = (data ?? []) as Array<PmsRow & { team_id: number | null }>;
  if (!rows.length) return [];
  const matchIds = Array.from(new Set(rows.map(r => r.match_id)));
  const kickoff: Record<number, string> = {};
  for (let i = 0; i < matchIds.length; i += 500) {
    const { data: ms } = await s.from("matches").select("id,kickoff_utc").in("id", matchIds.slice(i, i + 500));
    for (const m of (ms ?? []) as Array<{ id: number; kickoff_utc: string }>) kickoff[m.id] = m.kickoff_utc;
  }
  const start = seasonStartIso();
  const score: Record<number, number> = {};
  const mins: Record<number, number> = {};
  for (const r of rows) {
    const k = kickoff[r.match_id];
    if (!k || k < start) continue;
    score[r.player_id] = (score[r.player_id] ?? 0)
      + (r.goals ?? 0) + (r.assists ?? 0) + 0.5 * Number(r.xg ?? 0) + 0.5 * Number(r.xa ?? 0);
    mins[r.player_id] = (mins[r.player_id] ?? 0) + (r.minutes ?? 0);
  }
  return Object.keys(score)
    .map(Number)
    .filter(id => (mins[id] ?? 0) >= 450) // ~5 full matches: no one-cameo wonders
    .sort((a, b) => score[b] - score[a])
    .slice(0, top);
}

/** Poisson score matrix from two expected-goal lambdas. */
export function poissonMatrix(hxg: number, axg: number, n = 5): number[][] {
  const fact = [1, 1, 2, 6, 24, 120, 720];
  const p = (l: number, k: number) => Math.exp(-l) * Math.pow(l, k) / fact[k];
  const m: number[][] = [];
  for (let h = 0; h < n; h++) {
    const row: number[] = [];
    for (let a = 0; a < n; a++) row.push(p(hxg, h) * p(axg, a));
    m.push(row);
  }
  return m;
}

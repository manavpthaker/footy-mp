/**
 * Server-side reads over Supabase for the dashboard + entity pages.
 * All functions are called from server components — they await server() to
 * get a cookie-aware @supabase/ssr client.
 */
import { server, Team, Player, League, Country, Match, Prediction, Follow, ModelRating, EntityType } from "./supabase";

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
    s.from("matches").select("*").eq("league_id", leagueId).eq("status", "final"),
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

  const teamIds = Object.keys(stats).map(Number);
  const forms = await Promise.all(teamIds.map(id => formLast5(id)));
  const formByTeam = new Map(teamIds.map((id, i) => [id, forms[i]]));

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

/** Followed leagues that actually have completed matches (for the Tables chip rail). */
export async function tableableLeagues(): Promise<League[]> {
  const s = await server();
  const { data } = await s
    .from("leagues")
    .select("*")
    .in("name", ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"]);
  return (data ?? []) as League[];
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

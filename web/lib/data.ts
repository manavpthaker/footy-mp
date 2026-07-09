/**
 * Server-side reads over Supabase for the dashboard + entity pages.
 * Everything here is idempotent / cache-safe: we call server() for the
 * session, and let Next's route-segment cache handle re-fetching.
 */
import { server, Team, Player, League, Country, Match, Prediction, Follow, ModelRating, EntityType } from "./supabase";

export const USER_ID = "mp";
export const MODEL_VERSION = "footy-mp-v1";

// ---------- Follows ----------

export async function listFollows(): Promise<Follow[]> {
  const { data } = await server().from("follows").select("*").eq("user_id", USER_ID);
  return (data ?? []) as Follow[];
}

export async function loadFollowedEntities(): Promise<{
  players: Player[]; teams: Team[]; leagues: League[]; countries: Country[];
}> {
  const follows = await listFollows();
  const groups: Record<EntityType, number[]> = {
    player: [], team: [], league: [], country: [],
  };
  for (const f of follows) groups[f.entity_type].push(f.entity_id);

  const s = server();
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
  const nowIso = new Date().toISOString();
  const { data } = await server()
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
  const { data } = await server()
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
  const { data } = await server()
    .from("matches")
    .select("*")
    .eq("league_id", leagueId)
    .gte("kickoff_utc", start)
    .lte("kickoff_utc", end)
    .order("kickoff_utc", { ascending: true });
  return enrich((data ?? []) as Match[]);
}

export async function resultsForLeague(leagueId: number, limit = 20): Promise<RichMatch[]> {
  const { data } = await server()
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
  const s = server();
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
  const { data } = await server().from("teams").select("*").eq("id", id).maybeSingle();
  return (data ?? null) as Team | null;
}
export async function getPlayer(id: number): Promise<Player | null> {
  const { data } = await server().from("players").select("*").eq("id", id).maybeSingle();
  return (data ?? null) as Player | null;
}
export async function getLeague(id: number): Promise<League | null> {
  const { data } = await server().from("leagues").select("*").eq("id", id).maybeSingle();
  return (data ?? null) as League | null;
}
export async function getCountry(id: number): Promise<Country | null> {
  const { data } = await server().from("countries").select("*").eq("id", id).maybeSingle();
  return (data ?? null) as Country | null;
}

export async function latestRatingForTeam(id: number): Promise<ModelRating | null> {
  const { data } = await server()
    .from("model_ratings").select("*")
    .eq("team_id", id).eq("model_version", MODEL_VERSION)
    .order("as_of_date", { ascending: false }).limit(1).maybeSingle();
  return (data ?? null) as ModelRating | null;
}

export async function teamsInLeague(leagueId: number): Promise<Team[]> {
  const { data } = await server().from("teams").select("*").eq("league_id", leagueId).order("name");
  return (data ?? []) as Team[];
}

export async function playersOnTeam(teamId: number): Promise<Player[]> {
  const { data } = await server().from("players").select("*").eq("team_id", teamId).order("name");
  return (data ?? []) as Player[];
}

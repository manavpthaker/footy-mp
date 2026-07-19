/**
 * Universal search — one query across teams, players, leagues, and countries.
 * Case-insensitive substring match on names; ranked with prefix matches first.
 * Server-side only (uses the cookie-aware Supabase client).
 */
import { server, Team, Player, League, Country } from "./supabase";

export interface SearchResults {
  teams: Team[];
  players: Player[];
  leagues: League[];
  countries: Country[];
  /** club names for the matched players, keyed by team id */
  playerClubs: Record<number, string>;
}

const EMPTY: SearchResults = { teams: [], players: [], leagues: [], countries: [], playerClubs: {} };

function rank<T extends { name: string }>(rows: T[], q: string): T[] {
  const lq = q.toLowerCase();
  return [...rows].sort((a, b) => {
    const ap = a.name.toLowerCase().startsWith(lq) ? 0 : 1;
    const bp = b.name.toLowerCase().startsWith(lq) ? 0 : 1;
    return ap - bp || a.name.length - b.name.length;
  });
}

export async function searchEntities(q: string, limit = 8): Promise<SearchResults> {
  const query = q.trim();
  if (query.length < 2) return EMPTY;
  const s = await server();
  // escape LIKE wildcards in user input
  const safe = query.replace(/[%_]/g, m => `\\${m}`);
  const pattern = `%${safe}%`;

  const [teamsRes, playersRes, leaguesRes, countriesRes] = await Promise.all([
    s.from("teams").select("*").ilike("name", pattern).limit(limit * 2),
    s.from("players").select("*").ilike("name", pattern).limit(limit * 2),
    s.from("leagues").select("*").ilike("name", pattern).limit(limit),
    s.from("countries").select("*").ilike("name", pattern).limit(limit),
  ]);

  const teams = rank((teamsRes.data ?? []) as Team[], query).slice(0, limit);
  const players = rank((playersRes.data ?? []) as Player[], query).slice(0, limit);
  const leagues = rank((leaguesRes.data ?? []) as League[], query).slice(0, limit);
  const countries = rank((countriesRes.data ?? []) as Country[], query).slice(0, limit);

  const clubIds = Array.from(new Set(players.map(p => p.team_id).filter((x): x is number => x != null)));
  let playerClubs: Record<number, string> = {};
  if (clubIds.length) {
    const { data } = await s.from("teams").select("id,name").in("id", clubIds);
    playerClubs = Object.fromEntries(((data ?? []) as Array<{ id: number; name: string }>).map(t => [t.id, t.name]));
  }
  return { teams, players, leagues, countries, playerClubs };
}

import { cache } from "react";
import { server, type Player, type Team } from "./supabase";
import { loadFollowedEntities, teamsByIds, nationalTeamForCountry, getTeam,
  playersOnTeam, squadByClub, countriesByIds, upcomingForTeams,
  recentResultsForTeams, standingsForLeague, leaguesByIds } from "./data";
import { RECOGNITION } from "./recognition";

const fold = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
type Roster = { athletes?: Array<{ displayName?: string; position?: { abbreviation?: string } }> };

export const loadConnections = cache(async (requestedId?: number) => {
  const s = await server();
  const followed = await loadFollowedEntities();
  const [playerClubs, nationalTeams] = await Promise.all([
    teamsByIds(followed.players.map(p => p.team_id)),
    Promise.all(followed.countries.map(c => nationalTeamForCountry(c.id))),
  ]);
  let choices = Array.from(new Map([
    ...followed.teams, ...Object.values(playerClubs), ...nationalTeams.filter((t): t is Team => !!t),
  ].map(t => [t.id, t])).values());
  const requested = requestedId ? await getTeam(requestedId) : null;
  if (requestedId && !requested) return null;
  // Older starter follows can point to name-only shells. Resolve to the
  // source-backed team so switching clubs opens its actual roster and games.
  const names = Array.from(new Set([...choices.map(t => t.name), ...(requested ? [requested.name] : [])]));
  const { data: canonicalRows } = names.length
    ? await s.from("teams").select("*").in("name", names).not("espn_id", "is", null)
    : { data: [] };
  const canonical = (t: Team) => t.espn_id ? t : ((canonicalRows ?? []) as Team[])
    .find(c => c.name === t.name && c.is_national === t.is_national) ?? t;
  choices = Array.from(new Map(choices.map(t => canonical(t)).map(t => [t.id, t])).values());
  // Bayern is the user's current example, not a permanent country boundary.
  const team = (requested ? canonical(requested) : null) ?? choices.find(t => t.name === "Bayern Munich") ?? choices[0];
  if (!team) return null;
  if (!choices.some(t => t.id === team.id)) choices.unshift(team);
  const [storedPlayers, countryGroups, upcoming, results, table] = await Promise.all([
    team.is_national ? Promise.resolve([]) : playersOnTeam(team.id),
    team.is_national && team.country_id ? squadByClub(team.country_id) : Promise.resolve([]),
    upcomingForTeams([team.id], 10), recentResultsForTeams([team.id], 8),
    team.league_id && !team.is_national ? standingsForLeague(team.league_id) : Promise.resolve(null),
  ]);
  let players: Player[] = team.is_national ? countryGroups.flatMap(g => g.players) : storedPlayers;
  let rosterChecked = false;
  // Only use exact source names. A stale database alias must not create a
  // second player or suggest someone who is absent from the current roster.
  if (!team.is_national && team.espn_id && table?.league?.espn_slug) {
    try {
      const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${encodeURIComponent(table.league.espn_slug)}/teams/${encodeURIComponent(team.espn_id)}/roster`, {
        next: { revalidate: 3600 }, signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const roster: Roster = await res.json();
        if (roster.athletes?.length) {
          const byName = new Map(roster.athletes.filter(a => a.displayName).map(a => [fold(a.displayName!), a]));
          players = players.filter(p => byName.has(fold(p.name))).map(p => ({
            ...p, position: byName.get(fold(p.name))?.position?.abbreviation ?? p.position,
          }));
          rosterChecked = true;
        }
      }
    } catch { /* Stored roster is explicitly labelled below. */ }
  }
  const followedPlayerIds = new Set(followed.players.map(p => p.id));
  const priority = ["Luis Díaz", "Harry Kane", "Michael Olise", "Jamal Musiala"];
  players.sort((a, b) => {
    const rank = (p: Player) => priority.includes(p.name) ? priority.indexOf(p.name) : followedPlayerIds.has(p.id) ? 10 : p.country_id ? 20 : 30;
    return rank(a) - rank(b) || a.name.localeCompare(b.name);
  });
  const countryIds = Array.from(new Set(players.flatMap(p => p.country_id ? [p.country_id] : [])));
  const [countries, clubs, previousClubsRes, otherPlayersRes] = await Promise.all([
    countriesByIds(countryIds), teamsByIds(players.map(p => p.team_id)),
    s.from("teams").select("*").in("name", Object.values(RECOGNITION).map(r => r.previousClub)),
    countryIds.length ? s.from("players").select("*").in("country_id", countryIds).order("name").limit(1000) : Promise.resolve({ data: [] }),
  ]);
  const otherPlayers = (otherPlayersRes.data ?? []) as Player[];
  const otherClubs = await teamsByIds(otherPlayers.map(p => p.team_id));
  const leagueIds = Array.from(new Set([team.league_id, ...upcoming.map(m => m.league_id), ...results.map(m => m.league_id)].filter((id): id is number => !!id)));
  const competitions = Object.values(await leaguesByIds(leagueIds));
  const visiblePlayers = players.slice(0, 4);
  const visibleCountries = new Set(visiblePlayers.flatMap(p => p.country_id ? [p.country_id] : []));
  const branches = Array.from(visibleCountries).flatMap(cid => {
    const country = countries[cid];
    if (!country) return [];
    const clubGroups = new Map<number, { club: Team; players: Player[] }>();
    for (const p of otherPlayers) {
      const club = p.team_id ? otherClubs[p.team_id] : null;
      if (p.country_id !== cid || !club || club.is_national || club.id === team.id) continue;
      const group = clubGroups.get(club.id) ?? { club, players: [] };
      group.players.push(p); clubGroups.set(club.id, group);
    }
    return [{ country, here: visiblePlayers.filter(p => p.country_id === cid), clubs: Array.from(clubGroups.values())
      .sort((a, b) => Number(choices.some(t => t.id === b.club.id)) - Number(choices.some(t => t.id === a.club.id)) || b.players.length - a.players.length).slice(0, 2) }];
  });
  return { team, choices, players, countries, clubs, branches, competitions, table, rosterChecked,
    upcoming: upcoming.filter(m => m.status === "live" || +new Date(m.kickoff_utc) >= Date.now()), results,
    previousClubs: (previousClubsRes.data ?? []) as Team[], followedPlayerIds,
    followedCountryIds: new Set(followed.countries.map(c => c.id)),
  };
});
export type Connections = NonNullable<Awaited<ReturnType<typeof loadConnections>>>;

export const foldPlayerName = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
type Athlete = { displayName?: string; dateOfBirth?: string; position?: { abbreviation?: string }; defaultTeam?: { $ref?: string } };
export function currentRosterNames(athletes: Athlete[], espnId: string, national: boolean) {
  return new Map(athletes.filter(a => {
    const club = a.defaultTeam?.$ref?.split("?")[0].split("/").at(-1);
    return a.displayName && (national || !club || club === espnId);
  }).map(a => [foldPlayerName(a.displayName!), a]));
}
export function matchRosterPlayers<T extends { name: string; dob?: string | null; country_id?: number | null }>(players: T[], names: Map<string, Athlete>): T[] {
  const selected = new Map<string, T>();
  for (const p of players) {
    const name = foldPlayerName(p.name), athlete = names.get(name);
    if (!athlete) continue;
    const dob = athlete.dateOfBirth?.slice(0, 10);
    if (dob && p.dob && dob !== p.dob) continue;
    const score = (v: T) => (dob && v.dob === dob ? 4 : 0) + (v.country_id ? 1 : 0);
    const previous = selected.get(name);
    if (!previous || score(p) > score(previous)) selected.set(name, p);
  }
  return [...selected.values()];
}
export async function sourceRoster(espnId: string, slug: string, national: boolean) {
  try {
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${encodeURIComponent(slug)}/teams/${encodeURIComponent(espnId)}/roster`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data.athletes) || !data.athletes.length) return null;
    return { names: currentRosterNames(data.athletes, espnId, national), checkedAt: data.timestamp as string | undefined,
      season: data.season?.displayName as string | undefined,
      sourceUrl: `https://www.espn.com/soccer/team/squad/_/id/${espnId}` };
  } catch { return null; }
}

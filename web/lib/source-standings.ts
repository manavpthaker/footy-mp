type SourceEntry = {
  team: { id: string; displayName: string; logos?: { href: string }[]; isNational?: boolean };
  stats: { name: string; value?: number; displayValue?: string }[];
  note?: { description?: string };
};
type SourceNode = { name?: string; standings?: { entries?: SourceEntry[] }; children?: SourceNode[] };
export type SourceStandings = SourceNode & { season?: { year?: number; displayName?: string; endDate?: string } };

export function parseStandings(data: SourceStandings) {
  const groups: { name: string; entries: (SourceEntry & { rank: number; values: Record<string, number> })[] }[] = [];
  function walk(node: SourceNode) {
    if (node.standings?.entries?.length) {
      const entries = node.standings.entries.map(e => {
        const values = Object.fromEntries(e.stats.filter(s => typeof s.value === "number").map(s => [s.name, s.value! ]));
        return { ...e, values, rank: values.rank ?? 0 };
      }).sort((a, b) => a.rank - b.rank);
      groups.push({ name: node.name ?? "Standings", entries });
    }
    node.children?.forEach(walk);
  }
  walk(data);
  return { groups, season: data.season?.displayName ?? String(data.season?.year ?? ""),
    complete: !!data.season?.endDate && +new Date(data.season.endDate) < Date.now() };
}

export async function sourceStandings(slug: string) {
  try {
    const response = await fetch(`https://site.web.api.espn.com/apis/v2/sports/soccer/${encodeURIComponent(slug)}/standings`, {
      next: { revalidate: 300 }, signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) return null;
    const table = parseStandings(await response.json());
    if (!table.groups.length) return null;
    return { ...table, checkedAt: response.headers.get("date"),
      sourceUrl: `https://www.espn.com/soccer/standings/_/league/${encodeURIComponent(slug)}` };
  } catch { return null; }
}

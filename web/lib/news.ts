/**
 * News — free, no key: Google News RSS, fetched server-side and cached via
 * Next's fetch cache (15 min). One general football wire plus per-entity
 * queries (team, player, league) for contextual sections.
 *
 * Everything degrades to an empty list on any failure — news is garnish,
 * never a reason for a page to error.
 */

export interface NewsItem {
  title: string;
  url: string;
  source: string | null;
  publishedAt: string | null;   // ISO
}

const REVALIDATE_SECONDS = 900;

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .trim();
}

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decodeEntities(m[1]) : null;
}

/** Parse the handful of RSS fields we need — no XML dependency. */
function parseRss(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = m[1];
    const title = tag(block, "title");
    const url = tag(block, "link");
    if (!title || !url) continue;
    const pub = tag(block, "pubDate");
    items.push({
      title,
      url,
      source: tag(block, "source"),
      publishedAt: pub ? new Date(pub).toISOString() : null,
    });
  }
  return items;
}

/**
 * Google News sorts search feeds by RELEVANCE, not recency — without a window
 * a strong two-week-old story outranks yesterday's. So every query carries a
 * `when:` window, and we re-sort by pubDate ourselves before slicing.
 */
async function fetchRss(query: string, limit: number, when: string): Promise<NewsItem[]> {
  const url = "https://news.google.com/rss/search?q="
    + encodeURIComponent(`${query} when:${when}`) + "&hl=en-US&gl=US&ceid=US:en";
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { "User-Agent": "footy-mp/1.0" },
    });
    if (!res.ok) return [];
    return parseRss(await res.text())
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
      .slice(0, limit);
  } catch {
    return [];
  }
}

/** The general wire: transfers, managerial moves, the big storylines. */
export async function generalFootballNews(limit = 20): Promise<NewsItem[]> {
  return fetchRss('soccer football (transfer OR signing OR manager OR "World Cup" OR final)', limit, "2d");
}

/** News for one team. Quote the name; add "football" so e.g. "Arsenal" stays on-topic. */
export async function newsForTeam(teamName: string, limit = 6): Promise<NewsItem[]> {
  return fetchRss(`"${teamName}" football`, limit, "7d");
}

/** News for one player, anchored by their club/country when we know it. */
export async function newsForPlayer(playerName: string, teamName?: string | null, limit = 6): Promise<NewsItem[]> {
  const anchor = teamName ? ` "${teamName}"` : " football";
  return fetchRss(`"${playerName}"${anchor}`, limit, "14d");
}

/** News for a competition. */
export async function newsForLeague(leagueName: string, limit = 8): Promise<NewsItem[]> {
  return fetchRss(`"${leagueName}" football`, limit, "7d");
}

export function timeAgo(iso: string | null): string | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

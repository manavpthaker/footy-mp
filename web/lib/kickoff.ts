import type { RichMatch } from "./data";

/** The database stores dates, but ESPN can use placeholder times for TBD games.
 * Confirm scheduled times from the source; failed reads leave time unverified.
 * Scoreboards are shared across matches and cached for 15 minutes by Next.js.
 */
export async function withKickoffConfidence(matches: RichMatch[]): Promise<RichMatch[]> {
  type Scoreboard = { events?: Array<{ id: string; date?: string; competitions?: Array<{ timeValid?: boolean }> }> };
  const urls = new Map<string, Promise<Scoreboard | null>>();
  for (const m of matches) {
    if (m.status !== "scheduled" || !m.espn_event_id || !m.league?.espn_slug) continue;
    const key = `${m.league.espn_slug}/${m.kickoff_utc.slice(0, 10)}`;
    if (urls.has(key)) continue;
    const day = m.kickoff_utc.slice(0, 10).replaceAll("-", "");
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${encodeURIComponent(m.league.espn_slug)}/scoreboard?dates=${day}`;
    urls.set(key, fetch(url, { next: { revalidate: 900 }, signal: AbortSignal.timeout(4000) })
      .then(r => r.ok ? r.json() : null).catch(() => null));
  }
  return Promise.all(matches.map(async m => {
    if (m.status !== "scheduled") return m;
    const data = await urls.get(`${m.league?.espn_slug}/${m.kickoff_utc.slice(0, 10)}`);
    const event = data?.events?.find((e: { id: string }) => String(e.id) === m.espn_event_id);
    const competition = event?.competitions?.[0];
    const valid = competition?.timeValid;
    const sameDate = event?.date && +new Date(event.date) === +new Date(m.kickoff_utc);
    // The federation's September 17 announcement gives 23:45 UTC for this
    // fixture; ESPN lists 23:00 UTC. Do not present either as settled.
    // https://www.fcf.com.co/2026/09/17/convocatoria-de-la-seleccion-colombia-de-mayores-amistosos-internacionales-de-septiembre-octubre-2026/
    const colombiaPeru = m.kickoff_utc.startsWith("2026-10-06")
      && [m.home_team?.name, m.away_team?.name].includes("Colombia")
      && [m.home_team?.name, m.away_team?.name].includes("Peru");
    return { ...m, kickoff_confirmed: !colombiaPeru && sameDate && typeof valid === "boolean" ? valid : null };
  }));
}

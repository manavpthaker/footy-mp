import Link from "next/link";
import { server, type Team } from "@/lib/supabase";
import { standingsForLeague } from "@/lib/data";
import { FindConnection } from "@/components/search/FindConnection";

export const dynamic = "force-dynamic";
export default async function ExploreScreen() {
  const s = await server();
  const [mlsResult, nationalResult] = await Promise.all([
    s.from("leagues").select("id").eq("espn_slug", "usa.1").maybeSingle(),
    s.from("teams").select("*").eq("is_national", true).not("espn_id", "is", null).order("name"),
  ]);
  const mls = mlsResult.data ? await standingsForLeague(mlsResult.data.id) : null;
  const teams = ((nationalResult.data ?? []) as Team[]).filter(t => !/winner|loser|tbd|to be decided/i.test(t.name));
  const featured = ["United States", "Colombia", "Mexico", "Canada", "Argentina", "England", "France", "Germany"];
  return <div style={{ padding: 20, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
    <Link className="circle-link" href="/">← Football connections</Link>
    <h1>Find your next team</h1>
    <p className="circle-small">Open a team to meet its players, see where they play, and find its next match.</p>
    <FindConnection />
    <section className="circle-section"><h2>MLS clubs</h2>
      <p className="circle-small">Follow the players from their MLS club to their country. A country connection does not guarantee a national-team call-up.</p>
      {mls?.groups?.map(g => <div key={g.name}><h3>{g.name}</h3><div className="connection-choices">{g.rows.map(r => <Link key={r.teamId} className="connection-choice" href={`/?team=${r.teamId}`}>{r.team}</Link>)}</div></div>)}
      {mls && <Link className="circle-link" href={`/leagues/${mls.league!.id}`}>MLS standings and schedule →</Link>}
    </section>
    <section className="circle-section"><h2>National teams</h2>
      <p className="circle-small">Their players come together from clubs around the world. Open a country to see those club connections.</p>
      <div className="connection-choices">{teams.filter(t => featured.includes(t.name)).sort((a,b) => featured.indexOf(a.name)-featured.indexOf(b.name)).map(t => <Link key={t.id} className="connection-choice" href={`/?team=${t.id}`}>{t.name}</Link>)}</div>
      <details className="circle-details"><summary>All {teams.length} national teams</summary><div className="connection-choices">{teams.map(t => <Link key={t.id} className="connection-choice" href={`/?team=${t.id}`}>{t.name}</Link>)}</div></details>
    </section>
  </div>;
}

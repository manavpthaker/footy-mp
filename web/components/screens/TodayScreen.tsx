import React from "react";
import { getChatConfig } from "@/lib/chat-config";
import Link from "next/link";
import { Pad } from "@/components/mobile/primitives";
import { FollowToggle } from "@/components/mobile/FollowToggle";
import { AskAbout } from "@/components/search/AskAbout";
import { FindConnection } from "@/components/search/FindConnection";
import { loadConnections, type Connections } from "@/lib/connections";
import { RECOGNITION, playerRole } from "@/lib/recognition";
import { flagFor } from "@/lib/format";
import type { RichMatch } from "@/lib/data";
import type { Player } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function TodayScreen({ searchParams }: { searchParams?: { team?: string } }) {
  const chatConfigured = await getChatConfig().then(c => !!c.apiKey).catch(() => false);
  const requested = Number(searchParams?.team);
  const data = await loadConnections(Number.isSafeInteger(requested) && requested > 0 ? requested : undefined);
  if (!data) return <Pad><h1>Start with a team you’re watching.</h1><p>Search for a club or national team, then follow the connections through its players.</p><FindConnection /></Pad>;
  const { team, players, countries, upcoming, results, table, competitions } = data;
  const position = table?.rows.find(r => r.teamId === team.id);
  return <Pad style={{ paddingTop: 20, paddingBottom: 28, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
    <section className="circle-intro">
      <div className="circle-kicker">The football connections</div>
      <h1>Who am I watching?</h1>
      <p>Start with any team. Recognise the players. See how the rest of football connects.</p>
      <div className="connection-choices" aria-label="Choose a team to explore">
        {data.choices.map(t => <Link key={t.id} href={`/?team=${t.id}`} aria-current={t.id === team.id ? "page" : undefined} className={t.id === team.id ? "connection-choice selected" : "connection-choice"}>{t.name}</Link>)}
      </div>
      <FindConnection />
      <Link className="circle-link" href="/explore">Explore MLS and national teams →</Link>
    </section>

    <section className="circle-section" aria-labelledby="team-context">
      <div className="circle-kicker">Start here · {team.is_national ? "National team" : "Club"}</div>
      <h2 id="team-context"><Link href={`/teams/${team.id}`}>{team.name} →</Link></h2>
      <p className="circle-small">{team.is_national
        ? "These players come together for their country. Between international games, they play for different clubs."
        : `This is a club${table?.league ? ` in the ${table.league.name}` : ""}. Its players come from different countries and can represent different national teams.`}</p>
      <details className="circle-details"><summary>Latest result, next game and standings</summary>
      {results[0] && <Game match={results[0]} label="Last result" />}
      {upcoming[0] ? <Game match={upcoming[0]} label="Next game" /> : <p className="circle-empty">The next game is not loaded yet.</p>}
      {position && <p className="circle-small"><Link className="circle-link" href={`/leagues/${table!.league!.id}`}>#{position.pos}{position.group ? ` · ${position.group}` : ""} · {position.Pts} points from {position.P} games →</Link><br />{table!.season} · {table!.source === "ESPN" ? "ESPN source standings" : "Based on available results; coverage may be incomplete."}</p>}
      <details className="circle-details"><summary>More results and dates</summary>
        {upcoming.slice(1, 4).map(m => <Game key={m.id} match={m} label="Coming up" />)}
        {results.slice(1, 4).map(m => <Game key={m.id} match={m} label="Recent result" />)}
      </details>
      </details>
    </section>

    <section className="circle-section" aria-labelledby="recognise-players">
      <div className="circle-kicker">Put a story to the face</div>
      <h2 id="recognise-players">Where do I know them from?</h2>
      <p className="circle-small">{data.rosterPartial ? "ESPN has only a partial player list for this team. " : data.rosterChecked ? "Matched to ESPN’s team player list. " : "Some player and club links may be out of date. "}Country connections can include past internationals; they don’t guarantee a current call-up.</p>
      {players.slice(0, 4).map(p => <RecognitionCard key={p.id} player={p} data={data} />)}
      {players.length > 4 && <details className="circle-details"><summary>Explore {players.length - 4} more players</summary>
        {players.slice(4).map(p => <RecognitionCard key={p.id} player={p} data={data} />)}
      </details>}
      {players.length === 0 && <p className="circle-empty">Player connections are not available for this team yet.</p>}
    </section>

    <section className="circle-section" aria-labelledby="next-connections">
      <div className="circle-kicker">Follow a connection</div>
      <h2 id="next-connections">Now other clubs start to mean something.</h2>
      <p className="circle-small">{team.is_national ? "Pick a player’s club above to meet the teammates from other countries." : "A player’s country connects you to players at other clubs. They can be club opponents and country teammates."} Some club links may be out of date. A country connection does not mean a player is in its latest squad.</p>
      {!team.is_national && data.branches.map(branch => <article className="circle-player" key={branch.country.id}>
        <div className="circle-kicker">Through {branch.here.map(p => p.name).join(" & ")}</div>
        <h3><Link href={`/countries/${branch.country.id}`}>{flagFor(branch.country.name, branch.country.fifa_code)} {branch.country.name} →</Link></h3>
        {branch.clubs.map(g => <div key={g.club.id} className="connection-branch">
          <span className="circle-small">{g.players.slice(0, 2).map(p => p.name).join(" · ")}</span>
          <Link className="circle-link" href={`/?team=${g.club.id}`}>Explore {g.club.name} →</Link>
        </div>)}
        {!branch.clubs.length && <p className="circle-small">Other club connections are not available yet.</p>}
      </article>)}
      <p className="circle-small">You don’t need to follow every connection. Star the players you’re curious about; their club games appear in your schedule.</p>
      <Link className="circle-link" href="/following">Manage what you follow →</Link>
    </section>

    <section className="circle-section" aria-labelledby="competitions-title">
      <div className="circle-kicker">Why do these teams play each other?</div>
      <h2 id="competitions-title">Same sport. Different competitions.</h2>
      {competitions.map(l => <Link className="circle-game" key={l.id} href={`/leagues/${l.id}`}><strong>{l.name} →</strong><span className="circle-small">{l.format === "league" ? "The regular league race: clubs collect points across the season." : l.format === "cup" ? "A separate club competition. It has its own results and rules; league points do not carry over." : l.format === "friendly" ? "National teams meet outside a league or tournament points race." : "A separate national-team competition, with its own schedule and standings."}</span></Link>)}
      {!competitions.length && <Link className="circle-link" href="/map">See how leagues, cups and countries fit together →</Link>}
    </section>

    <section className="circle-talk" aria-labelledby="azi-title">
      <div className="circle-kicker">Explain it to Azi</div>
      <h2 id="azi-title">{team.is_national ? "“Same country. Different clubs.”" : "“Same club. Different countries.”"}</h2>
      <p>{!team.is_national && players[0] && players[1] && countries[players[0].country_id!] && countries[players[1].country_id!]
        ? `“${players[0].name} and ${players[1].name} are teammates at ${team.name}. Their country connections are ${countries[players[0].country_id!].name} and ${countries[players[1].country_id!].name}. Club teams and national teams are two different ways the players come together.”`
        : "“Players connect all these teams. We can start with someone we recognise, then learn about their teammates, country and previous clubs.”"}</p>
      {chatConfigured && <AskAbout label="Explain these connections" question={`We are watching ${team.name}. Explain the connections between its players, their national teams, previous clubs and competitions in simple language for me and Azi. Use dated evidence, distinguish youth-team history from senior careers and nationality from a current call-up. Suggest one related team to explore without assuming what we have watched.`} />}
    </section>
    <div className="circle-footer"><Link href="/map">How football works</Link><Link href="/world">Wider football catch-up →</Link></div>
  </Pad>;
}

function RecognitionCard({ player: p, data }: { player: Player; data: Connections }) {
  const country = p.country_id ? data.countries[p.country_id] : null;
  const club = p.team_id ? data.clubs[p.team_id] : null;
  const history = RECOGNITION[p.name];
  const previous = history && data.previousClubs.find(t => t.name === history.previousClub);
  const role = playerRole(p.position);
  return <article className="circle-player">
    <div className="circle-player-head"><div><div className="circle-kicker">{role.label}</div><h3><Link href={`/players/${p.id}`}>{p.name} →</Link></h3></div><FollowToggle entityType="player" entityId={p.id} initialFollowed={data.followedPlayerIds.has(p.id)} /></div>
    <div className="connection-player-map">
      {club && <Link href={`/?team=${club.id}`}><span>Club</span><strong>{club.name}</strong></Link>}
      {country ? <Link href={`/countries/${country.id}`}><span>Country connection</span><strong>{flagFor(country.name, country.fifa_code)} {country.name}</strong></Link> : <span className="circle-small">Country connection not loaded</span>}
    </div>
    {country && data.followedCountryIds.has(country.id) && <p className="circle-small">★ You already follow {country.name}.</p>}
    {history && <><p>{history.note}</p><div className="circle-footer" style={{ marginTop: 4 }}>{previous && <Link className="circle-link" href={`/?team=${previous.id}`}>Explore {history.previousClub} →</Link>}<a className="circle-link" href={history.source} target="_blank" rel="noreferrer">Career history ↗</a></div></>}
    <details className="circle-details"><summary>What to watch for</summary><p className="circle-small">{role.watch} A club’s score does not tell us whether this player appeared or how they performed.</p></details>
  </article>;
}

function Game({ match: m, label }: { match: RichMatch; label: string }) {
  const stale = !m.updated_at || Date.now() - +new Date(m.updated_at) > 30 * 3600e3;
  const confirmed = m.status !== "scheduled" || m.kickoff_confirmed === true;
  const when = new Date(m.kickoff_utc).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/New_York", ...(confirmed ? { hour: "numeric", minute: "2-digit", timeZoneName: "short" } as const : {}) });
  return <Link className="circle-game" href={`/matches/${m.id}`}><span className="circle-kicker">{m.status === "live" ? "Live now" : label} · {m.league?.name ?? "Match"}</span><strong>{m.home_team?.name ?? "Home"}{m.status === "scheduled" ? " vs " : ` ${m.home_goals ?? "–"}–${m.away_goals ?? "–"} `}{m.away_team?.name ?? "Away"}</strong><span className="circle-small"><time dateTime={m.kickoff_utc}>{when}</time>{!confirmed ? m.kickoff_confirmed === false ? " · Time to be confirmed" : " · Time unverified" : ""}</span>{stale && <span className="circle-warning">This match hasn’t been checked recently.</span>}<span className="circle-link">Open the game →</span></Link>;
}

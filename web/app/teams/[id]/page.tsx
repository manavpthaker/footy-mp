import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell, Panel, SectionHeading } from "@/components/AppShell";
import { MatchRow } from "@/components/MatchRow";
import { FollowButton } from "@/components/FollowButton";
import { StatCard } from "@/components/StatCard";
import {
  getTeam, listFollows, upcomingForTeams, recentResultsForTeams,
  latestRatingForTeam, playersOnTeam, getLeague,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TeamPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const team = await getTeam(id);
  if (!team) notFound();

  const [follows, upcoming, recent, rating, players, league] = await Promise.all([
    listFollows(),
    upcomingForTeams([id], 10),
    recentResultsForTeams([id], 20),
    latestRatingForTeam(id),
    playersOnTeam(id),
    team.league_id ? getLeague(team.league_id) : Promise.resolve(null),
  ]);
  const followed = follows.some(f => f.entity_type === "team" && f.entity_id === id);

  const wins = recent.filter(r => r.winner_team_id === id).length;
  const draws = recent.filter(r =>
    r.status === "final" && r.home_goals === r.away_goals && !r.went_pens
  ).length;
  const losses = recent.filter(r =>
    r.status === "final" && r.winner_team_id !== null && r.winner_team_id !== id
  ).length;

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "var(--fs-hero)", margin: 0,
            textTransform: "uppercase", letterSpacing: "0.02em", fontWeight: 800,
          }}>{team.name}</h1>
          {team.is_national && <Tag>national team</Tag>}
          {league && <Link href={`/leagues/${league.id}`}><Tag>{league.name}</Tag></Link>}
          <div style={{ flex: 1 }} />
          <FollowButton entityType="team" entityId={id} initialFollowed={followed} />
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <StatCard label="record (recent)" value={`${wins}-${draws}-${losses}`}
                    sub={`${recent.length} matches`} />
          {rating && (
            <>
              <StatCard label="attack" value={rating.attack?.toFixed(2) ?? "—"} tone="accent" />
              <StatCard label="defense" value={rating.defense?.toFixed(2) ?? "—"} tone="steel" />
              <StatCard label="overall" value={rating.overall?.toFixed(2) ?? "—"} tone="gold" />
            </>
          )}
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 22,
        }}>
          <div>
            <SectionHeading eyebrow="next up">Upcoming</SectionHeading>
            {upcoming.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {upcoming.map(m => <MatchRow key={m.id} match={m} followedTeamIds={new Set([id])} />)}
              </div>
            ) : <p style={{ color: "var(--text-muted)" }}>Nothing scheduled.</p>}
          </div>
          <div>
            <SectionHeading eyebrow="last matches">Results</SectionHeading>
            {recent.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {recent.slice(0, 10).map(m => <MatchRow key={m.id} match={m} followedTeamIds={new Set([id])} />)}
              </div>
            ) : <p style={{ color: "var(--text-muted)" }}>No recorded results.</p>}
          </div>
        </div>

        {players.length > 0 && (
          <Panel>
            <SectionHeading eyebrow="squad">Players</SectionHeading>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8,
            }}>
              {players.map(p => (
                <Link key={p.id} href={`/players/${p.id}`}
                  style={{
                    padding: "8px 10px", borderRadius: "var(--radius-md)",
                    background: "var(--surface-tint)", border: "1px solid var(--border-soft)",
                    display: "flex", justifyContent: "space-between", gap: 8,
                  }}>
                  <span>{p.name}</span>
                  <span style={{ color: "var(--text-faint)", fontSize: "var(--fs-xs)" }}>{p.position ?? "—"}</span>
                </Link>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span style={{
    fontSize: "var(--fs-xs)", padding: "3px 8px",
    background: "var(--surface-raised)", color: "var(--text-muted)",
    borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
    textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600,
  }}>{children}</span>;
}

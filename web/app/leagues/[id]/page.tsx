import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell, Panel, SectionHeading } from "@/components/AppShell";
import { MatchRow } from "@/components/MatchRow";
import { FollowButton } from "@/components/FollowButton";
import {
  getLeague, listFollows, teamsInLeague, fixturesForLeague, resultsForLeague,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function LeaguePage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const league = await getLeague(id);
  if (!league) notFound();

  const [follows, teams, fixtures, results] = await Promise.all([
    listFollows(),
    teamsInLeague(id),
    fixturesForLeague(id, 14),
    resultsForLeague(id, 20),
  ]);
  const followed = follows.some(f => f.entity_type === "league" && f.entity_id === id);
  const followedTeamIds = new Set(
    follows.filter(f => f.entity_type === "team").map(f => f.entity_id)
  );

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "var(--fs-hero)", margin: 0,
            textTransform: "uppercase", letterSpacing: "0.02em", fontWeight: 800,
          }}>{league.name}</h1>
          {league.is_international && (
            <span style={{
              fontSize: "var(--fs-xs)", padding: "3px 8px",
              background: "var(--ember-tint)", color: "var(--accent)",
              borderRadius: "var(--radius-sm)", textTransform: "uppercase", letterSpacing: "0.08em",
            }}>international</span>
          )}
          <div style={{ flex: 1 }} />
          <FollowButton entityType="league" entityId={id} initialFollowed={followed} />
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 22,
        }}>
          <div>
            <SectionHeading eyebrow="fixtures · 2 weeks">Upcoming</SectionHeading>
            {fixtures.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {fixtures.map(m => <MatchRow key={m.id} match={m} followedTeamIds={followedTeamIds} />)}
              </div>
            ) : <p style={{ color: "var(--text-muted)" }}>No fixtures in the next two weeks.</p>}
          </div>
          <div>
            <SectionHeading eyebrow="latest">Results</SectionHeading>
            {results.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {results.map(m => <MatchRow key={m.id} match={m} followedTeamIds={followedTeamIds} />)}
              </div>
            ) : <p style={{ color: "var(--text-muted)" }}>No recorded results.</p>}
          </div>
        </div>

        <Panel>
          <SectionHeading eyebrow="clubs">Teams in this league</SectionHeading>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6,
          }}>
            {teams.map(t => (
              <Link key={t.id} href={`/teams/${t.id}`}
                style={{
                  padding: "8px 10px", borderRadius: "var(--radius-md)",
                  background: "var(--surface-tint)", border: `1px solid ${followedTeamIds.has(t.id) ? "rgba(255,206,83,0.25)" : "var(--border-soft)"}`,
                  color: "var(--text-primary)",
                }}>
                {followedTeamIds.has(t.id) && <span style={{ color: "var(--follow)" }}>★ </span>}{t.name}
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

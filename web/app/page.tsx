import Link from "next/link";
import { AppShell, Panel, SectionHeading } from "@/components/AppShell";
import { MatchRow } from "@/components/MatchRow";
import {
  loadFollowedEntities, upcomingForTeams, recentResultsForTeams,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { players, teams, leagues, countries } = await loadFollowedEntities();

  const followedTeamIds = new Set(teams.map(t => t.id));
  // include players' clubs so their fixtures show too
  players.forEach(p => p.team_id && followedTeamIds.add(p.team_id));

  const [upcoming, recent] = await Promise.all([
    upcomingForTeams(Array.from(followedTeamIds), 20),
    recentResultsForTeams(Array.from(followedTeamIds), 20),
  ]);

  const total = teams.length + players.length + leagues.length + countries.length;

  return (
    <AppShell>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 22 }}>
        <Panel>
          <div style={{
            fontSize: "var(--fs-2xs)", color: "var(--text-faint)",
            textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600,
          }}>your watchlist</div>
          <div style={{
            display: "flex", gap: 22, marginTop: 6, flexWrap: "wrap",
            fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums",
          }}>
            <Stat n={players.length} label="players" />
            <Stat n={teams.length} label="teams" />
            <Stat n={leagues.length} label="leagues" />
            <Stat n={countries.length} label="countries" />
          </div>
          {total === 0 && (
            <p style={{ color: "var(--text-muted)", marginTop: 12 }}>
              Nothing followed yet. Head to a team or league page and hit ★.
            </p>
          )}
        </Panel>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 22,
        }}>
          <div>
            <SectionHeading eyebrow="next up">Upcoming</SectionHeading>
            <MatchList matches={upcoming} followedTeamIds={followedTeamIds}
                       emptyMsg="No upcoming fixtures for anyone you follow." />
          </div>
          <div>
            <SectionHeading eyebrow="just in">Recent results</SectionHeading>
            <MatchList matches={recent} followedTeamIds={followedTeamIds}
                       emptyMsg="No recent results yet." />
          </div>
        </div>

        {(teams.length + leagues.length + countries.length + players.length) > 0 && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 22,
          }}>
            {leagues.length > 0 && (
              <div>
                <SectionHeading eyebrow="leagues">Following</SectionHeading>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {leagues.map(l => (
                    <Link key={l.id} href={`/leagues/${l.id}`}
                      style={{ ...linkPill }}>{l.name}</Link>
                  ))}
                </div>
              </div>
            )}
            {teams.length > 0 && (
              <div>
                <SectionHeading eyebrow="teams">Following</SectionHeading>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {teams.map(t => (
                    <Link key={t.id} href={`/teams/${t.id}`} style={linkPill}>
                      {t.is_national ? "◇ " : ""}{t.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {players.length > 0 && (
              <div>
                <SectionHeading eyebrow="players">Following</SectionHeading>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {players.map(p => (
                    <Link key={p.id} href={`/players/${p.id}`} style={linkPill}>
                      ★ {p.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {countries.length > 0 && (
              <div>
                <SectionHeading eyebrow="countries">Following</SectionHeading>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {countries.map(c => (
                    <Link key={c.id} href={`/countries/${c.id}`} style={linkPill}>{c.name}</Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

const linkPill: React.CSSProperties = {
  display: "block", padding: "8px 12px", borderRadius: "var(--radius-md)",
  background: "var(--surface-tint)", border: "1px solid var(--border-soft)",
  color: "var(--text-primary)", fontSize: "var(--fs-body)",
};

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div style={{
        fontSize: "var(--fs-display-num)", fontWeight: 700,
        color: n > 0 ? "var(--follow)" : "var(--text-faint)",
      }}>{n}</div>
      <div style={{
        fontSize: "var(--fs-2xs)", color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "0.1em",
      }}>{label}</div>
    </div>
  );
}

function MatchList({ matches, followedTeamIds, emptyMsg }: {
  matches: any[]; followedTeamIds: Set<number>; emptyMsg: string;
}) {
  if (!matches.length) {
    return <div style={{ color: "var(--text-muted)", fontSize: "var(--fs-sm)" }}>{emptyMsg}</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {matches.map(m => <MatchRow key={m.id} match={m} followedTeamIds={followedTeamIds} />)}
    </div>
  );
}

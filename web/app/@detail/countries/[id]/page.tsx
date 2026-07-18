import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Pad, eyebrow, EmptyState } from "@/components/mobile/primitives";
// @ts-ignore
import { SectionHeading } from "@/components/ds";
import { FixtureItem } from "@/components/mobile/FixtureItem";
import { FollowToggle } from "@/components/mobile/FollowToggle";
import {
  getCountry, listFollows, nationalTeamForCountry, leaguesForCountry,
  upcomingForTeams, recentResultsForTeams, squadByClub,
} from "@/lib/data";
import { flagFor } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const c = await getCountry(Number(params.id));
  return { title: c ? c.name : "Country" };
}

export default async function CountryDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const country = await getCountry(id);
  if (!country) notFound();
  const [team, leagues, follows, squad] = await Promise.all([
    nationalTeamForCountry(id),
    leaguesForCountry(id),
    listFollows(),
    squadByClub(id),
  ]);
  const [upcoming, results] = team
    ? await Promise.all([upcomingForTeams([team.id], 6), recentResultsForTeams([team.id], 6)])
    : [[], []];
  const followed = follows.some(f => f.entity_type === "country" && f.entity_id === id);
  const followedTeamIds = new Set(team ? [team.id] : []);

  return (
    <div>
      <ScreenHeader
        eyebrow={country.confederation ?? "country"}
        title={<span>{flagFor(country.name, country.fifa_code)} {country.name}</span>}
        right={<FollowToggle entityType="country" entityId={id} initialFollowed={followed} />}
      />
      <Pad style={{ paddingTop: 14 }}>
        {team && (
          <Link href={`/teams/${team.id}`} style={{
            display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit",
            background: "var(--surface-panel)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)", padding: "11px 13px",
          }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={eyebrow}>national team</div>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-h2)", marginTop: 2 }}>{team.name}</div>
            </div>
            <span style={{ color: "var(--accent-2)", fontSize: 16 }}>›</span>
          </Link>
        )}

        {upcoming.length > 0 && (
          <>
            <SectionHeading tick="var(--gold)">Upcoming</SectionHeading>
            {upcoming.map(m => <FixtureItem key={m.id} m={m} followedTeamIds={followedTeamIds} />)}
          </>
        )}

        {results.length > 0 && (
          <>
            <SectionHeading tick="var(--accent-2)">Latest results</SectionHeading>
            {results.map(m => <FixtureItem key={m.id} m={m} followedTeamIds={followedTeamIds} />)}
          </>
        )}

        {squad.length > 0 && (
          <>
            <SectionHeading tick="var(--gold)">Where the squad plays</SectionHeading>
            <div style={{ ...eyebrow, margin: "0 2px 8px" }}>
              the national team is built from these clubs — club form is how you
              scout {country.name} between camps
            </div>
            {squad.map((g, i) => (
              <div key={g.club?.id ?? `unknown-${i}`} style={{
                background: "var(--surface-panel)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)", padding: "9px 11px", marginBottom: 6,
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  {g.club ? (
                    <Link href={`/teams/${g.club.id}`} style={{
                      fontWeight: 700, fontSize: "var(--fs-sm)", color: "inherit",
                      textDecoration: "none",
                    }}>{g.club.name}</Link>
                  ) : (
                    <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--text-muted)" }}>
                      Club untracked
                    </span>
                  )}
                  {g.league && (
                    <Link href={`/leagues/${g.league.id}`} style={{
                      ...eyebrow, color: "var(--accent-2)", textDecoration: "none",
                    }}>{g.league.name}</Link>
                  )}
                  <span style={{ ...eyebrow, marginLeft: "auto" }}>{g.players.length}</span>
                </div>
                <div style={{
                  marginTop: 4, fontSize: "var(--fs-xs)", color: "var(--text-muted)",
                  lineHeight: 1.6,
                }}>
                  {g.players.map((p, j) => (
                    <React.Fragment key={p.id}>
                      {j > 0 && " · "}
                      <Link href={`/players/${p.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {p.name}{p.position ? ` (${p.position})` : ""}
                      </Link>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {leagues.length > 0 && (
          <>
            <SectionHeading tick="var(--accent-2)">Leagues</SectionHeading>
            {leagues.map(l => (
              <Link key={l.id} href={`/leagues/${l.id}`} style={{
                display: "flex", alignItems: "center", gap: 9, textDecoration: "none", color: "inherit",
                background: "var(--surface-panel)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)", padding: "9px 11px", marginBottom: 6,
              }}>
                <span style={{ fontSize: 15 }}>🏆</span>
                <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)", flex: 1 }}>{l.name}</span>
                <span style={{ color: "var(--accent-2)", fontSize: 14 }}>›</span>
              </Link>
            ))}
          </>
        )}

        {!team && leagues.length === 0 && (
          <EmptyState>No teams or leagues linked to {country.name} yet.</EmptyState>
        )}
        <div style={{ height: 16 }} />
      </Pad>
    </div>
  );
}

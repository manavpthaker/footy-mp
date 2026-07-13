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
  upcomingForTeams, recentResultsForTeams,
} from "@/lib/data";
import { flagFor } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CountryDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const country = await getCountry(id);
  if (!country) notFound();
  const [team, leagues, follows] = await Promise.all([
    nationalTeamForCountry(id),
    leaguesForCountry(id),
    listFollows(),
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

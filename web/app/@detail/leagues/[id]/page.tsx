import React from "react";
import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Pad, eyebrow } from "@/components/mobile/primitives";
// @ts-ignore
import { SectionHeading } from "@/components/ds";
import { FixtureItem } from "@/components/mobile/FixtureItem";
import { FollowToggle } from "@/components/mobile/FollowToggle";
import { LeagueStandings } from "./LeagueStandings";
import {
  getLeague, fixturesForLeague, resultsForLeague, listFollows, standingsForLeague,
} from "@/lib/data";
import { flagFor } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const l = await getLeague(Number(params.id));
  return { title: l ? l.name : "League" };
}

export default async function LeagueDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const league = await getLeague(id);
  if (!league) notFound();
  const [fixtures, results, follows, standings] = await Promise.all([
    fixturesForLeague(id, 30),
    resultsForLeague(id, 20),
    listFollows(),
    standingsForLeague(id),
  ]);
  const followed = follows.some(f => f.entity_type === "league" && f.entity_id === id);
  const followedTeamIds = new Set(follows.filter(f => f.entity_type === "team").map(f => f.entity_id));
  const rows = standings.rows.map(r => ({ ...r, flag: flagFor(r.team) }));

  return (
    <div>
      <ScreenHeader
        eyebrow={league.is_international ? "International" : "Domestic"}
        title={league.name}
        right={<FollowToggle entityType="league" entityId={id} initialFollowed={followed} />}
      />
      <Pad style={{ paddingTop: 14 }}>
        {fixtures.length > 0 && (
          <>
            <div style={{ ...eyebrow, margin: "0 2px 7px" }}>fixtures</div>
            {fixtures.map(m => (
              <FixtureItem key={m.id} m={m} followedTeamIds={followedTeamIds} showComp={false} />
            ))}
          </>
        )}
        {results.length > 0 && (
          <>
            <div style={{ ...eyebrow, margin: "12px 2px 7px" }}>latest</div>
            {results.map(m => (
              <FixtureItem key={m.id} m={m} followedTeamIds={followedTeamIds} showComp={false} />
            ))}
          </>
        )}
        {rows.length > 0 && (
          <>
            <SectionHeading>Standings</SectionHeading>
            <LeagueStandings rows={JSON.parse(JSON.stringify(rows))} />
          </>
        )}
        <div style={{ height: 16 }} />
      </Pad>
    </div>
  );
}

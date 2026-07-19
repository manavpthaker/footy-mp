import React from "react";
import { Pad, eyebrow } from "@/components/mobile/primitives";
// @ts-ignore
import { SectionHeading } from "@/components/ds";
import { NewsList } from "@/components/ds/NewsList";
import { generalFootballNews, newsForTeam, newsForLeague } from "@/lib/news";
import { loadFollowedEntities } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * The wire — a general football feed (transfers, sackings, storylines) plus a
 * personal block per followed team/league. This is the "know what's happening
 * without watching a single match" screen.
 */
export default async function NewsScreen() {
  const { teams, leagues } = await loadFollowedEntities();
  // cap the per-entity fan-out — RSS fetches are cached but not free
  const teamPicks = teams.slice(0, 6);
  const leaguePicks = leagues.slice(0, 3);

  const [general, teamNews, leagueNews] = await Promise.all([
    generalFootballNews(14),
    Promise.all(teamPicks.map(t => newsForTeam(t.name, 4))),
    Promise.all(leaguePicks.map(l => newsForLeague(l.name, 4))),
  ]);

  const personal: Array<{ heading: string; items: Awaited<ReturnType<typeof newsForTeam>> }> = [
    ...teamPicks.map((t, i) => ({ heading: t.name, items: teamNews[i] })),
    ...leaguePicks.map((l, i) => ({ heading: l.name, items: leagueNews[i] })),
  ].filter(s => s.items.length > 0);

  return (
    <div>
      <Pad style={{ paddingTop: 12 }}>
        {personal.length > 0 && (
          <>
            <SectionHeading tick="var(--follow)">Your wire</SectionHeading>
            {personal.map(s => (
              <div key={s.heading} style={{ marginBottom: 12 }}>
                <div style={{ ...eyebrow, margin: "0 2px 6px" }}>{s.heading}</div>
                <NewsList items={s.items} />
              </div>
            ))}
          </>
        )}

        <SectionHeading tick="var(--accent)">Around the world</SectionHeading>
        {general.length > 0
          ? <NewsList items={general} />
          : <div style={{ ...eyebrow, textAlign: "center", padding: "22px 0" }}>
              The wire is quiet — check back shortly.
            </div>}
        <div style={{ height: 16 }} />
      </Pad>
    </div>
  );
}

import React from "react";
import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Pad, eyebrow } from "@/components/mobile/primitives";
// @ts-ignore
import { SectionHeading } from "@/components/ds";
import { FixtureItem } from "@/components/mobile/FixtureItem";
import { FollowToggle } from "@/components/mobile/FollowToggle";
import { AskAbout } from "@/components/search/AskAbout";
import { StandingsContext } from "@/components/competition/StandingsContext";
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
  const context = competitionContext(league.format, league.is_international);

  return (
    <div>
      <ScreenHeader
        eyebrow={league.is_international ? "International" : "Domestic"}
        title={league.name}
        right={<FollowToggle entityType="league" entityId={id} initialFollowed={followed} />}
      />
      <Pad style={{ paddingTop: 14 }}>
        <section style={{
          padding: "12px 13px", background: "var(--surface-tint)",
          border: "1px solid var(--border)", borderLeft: "3px solid var(--accent)",
          borderRadius: "var(--radius-md)",
        }}>
          <div style={{ ...eyebrow, color: "var(--accent)" }}>{context.label}</div>
          <div style={{ marginTop: 4, fontSize: "var(--fs-h2)", fontWeight: 700, lineHeight: 1.35 }}>
            {context.title}
          </div>
          <p style={{ margin: "6px 0 10px", color: "var(--text-muted)", fontSize: "var(--fs-sm)", lineHeight: 1.6 }}>
            {context.body}
          </p>
          <AskAbout question={`Explain how ${league.name} works, what matters in it right now, and which teams or matches I should follow.`} />
        </section>

        {fixtures.length > 0 && (
          <>
            <SectionHeading tick="var(--accent-2)">Next on the calendar</SectionHeading>
            {fixtures.map(m => (
              <FixtureItem key={m.id} m={m} followedTeamIds={followedTeamIds} showComp={false} />
            ))}
          </>
        )}
        {rows.length > 0 && (
          <>
            <SectionHeading>
              Standings{standings.season ? ` · ${standings.season}` : ""}
              {standings.complete ? " · final" : ""}
            </SectionHeading>
            <p className="circle-small">{standings.source === "ESPN" ? <a href={standings.sourceUrl} target="_blank" rel="noreferrer">ESPN source standings ↗</a> : "Calculated from loaded results; coverage may be incomplete."}</p>
            {(!standings.groups || standings.groups.length === 1) && <StandingsContext
              leagueName={league.name}
              season={standings.season}
              complete={standings.complete}
              rows={rows}
            />}
            <LeagueStandings rows={JSON.parse(JSON.stringify(rows))} groups={standings.groups} />
          </>
        )}
        {results.length > 0 && (
          <>
            <SectionHeading tick="var(--gold)">Latest results</SectionHeading>
            {results.map(m => (
              <FixtureItem key={m.id} m={m} followedTeamIds={followedTeamIds} showComp={false} />
            ))}
          </>
        )}
        {fixtures.length === 0 && rows.length === 0 && results.length === 0 && (
          <div style={{
            marginTop: 12, border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
            padding: "11px 12px", color: "var(--gold)", fontSize: "var(--fs-sm)", lineHeight: 1.55,
          }}>No current fixtures, results or standings are loaded for this competition.</div>
        )}
        <div style={{ height: 16 }} />
      </Pad>
    </div>
  );
}

function competitionContext(format?: string | null, international?: boolean): {
  label: string; title: string; body: string;
} {
  switch (format) {
    case "league":
      return {
        label: "Season-long competition",
        title: "Consistency wins; the whole table matters.",
        body: "Teams collect three points for a win and one for a draw. The top can win the title or qualify for continental football, while the bottom can be relegated.",
      };
    case "cup":
      return {
        label: "Continental club competition",
        title: "This is where domestic leagues meet.",
        body: "Clubs qualify through domestic performance, then move through a league or group phase and knockout rounds. Always check whether a knockout is one match or a two-leg aggregate tie.",
      };
    case "qualifiers":
      return {
        label: "International qualifying campaign",
        title: "A multi-window route to a major tournament.",
        body: "National teams gather briefly, play a small part of the schedule, then return players to their clubs. Group position and confederation rules determine who advances.",
      };
    case "tournament":
      return {
        label: "National-team tournament",
        title: "A concentrated group stage followed by knockouts.",
        body: "Countries bring selected squads into one event. Group matches determine who advances; knockout matches can continue through extra time and penalties.",
      };
    case "friendly":
      return {
        label: "International preparation",
        title: "No table points, but selection and tactics still matter.",
        body: "Friendlies let national teams test players and systems during limited time together. Treat the result as context, not qualification progress.",
      };
    default:
      return {
        label: international ? "International competition" : "Club competition",
        title: "Start with the format, then read the current stage.",
        body: "Fixtures show what happens next, results show recent form, and the table or knockout phase explains the stakes.",
      };
  }
}

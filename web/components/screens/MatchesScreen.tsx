import React from "react";
import { MatchesClient } from "./MatchesClient";
import { upcomingAll, resultsAll, loadFollowedEntities, nationalTeamForCountry, upcomingForTeams, recentResultsForTeams } from "@/lib/data";
import { priorityUpcoming } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const [upcoming, results, follows, priority] = await Promise.all([
    upcomingAll(200),
    resultsAll(80),
    loadFollowedEntities(),
    priorityUpcoming(),
  ]);
  const nationalTeams = await Promise.all(follows.countries.map(c => nationalTeamForCountry(c.id)));
  const followedTeamIds = Array.from(new Set([
    ...follows.teams.map(t => t.id),
    ...follows.players.map(p => p.team_id).filter((x): x is number => x !== null),
    ...nationalTeams.flatMap(t => t ? [t.id] : []),
  ]));
  const [yoursUpcoming, yoursResults] = await Promise.all([
    upcomingForTeams(followedTeamIds, 100), recentResultsForTeams(followedTeamIds, 100),
  ]);
  const allUpcoming = Array.from(new Map([...upcoming, ...priority, ...yoursUpcoming].map(m => [m.id, m])).values())
    .filter(m => m.status === "live" || +new Date(m.kickoff_utc) >= Date.now())
    .sort((a, b) => a.kickoff_utc.localeCompare(b.kickoff_utc));
  const allResults = Array.from(new Map([...results, ...yoursResults].map(m => [m.id, m])).values())
    .sort((a, b) => b.kickoff_utc.localeCompare(a.kickoff_utc));
  return (
    <div>
      
      <MatchesClient
        upcoming={allUpcoming}
        results={allResults}
        followedTeamIds={followedTeamIds}
      />
    </div>
  );
}

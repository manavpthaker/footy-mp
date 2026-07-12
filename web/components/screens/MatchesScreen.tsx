import React from "react";
import { MatchesClient } from "./MatchesClient";
import { upcomingAll, resultsAll, loadFollowedEntities } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const [upcoming, results, follows] = await Promise.all([
    upcomingAll(200),
    resultsAll(80),
    loadFollowedEntities(),
  ]);
  const followedTeamIds = Array.from(new Set([
    ...follows.teams.map(t => t.id),
    ...follows.players.map(p => p.team_id).filter((x): x is number => x !== null),
  ]));
  return (
    <div>
      
      <MatchesClient
        upcoming={JSON.parse(JSON.stringify(upcoming))}
        results={JSON.parse(JSON.stringify(results))}
        followedTeamIds={followedTeamIds}
      />
    </div>
  );
}

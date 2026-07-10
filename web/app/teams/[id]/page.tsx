import React from "react";
import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { TeamClient } from "./TeamClient";
import {
  getTeam, getLeague, upcomingForTeams, recentResultsForTeams,
  latestRatingForTeam, playersOnTeam, formLast5, factorsForTeam,
  listFollows,
} from "@/lib/data";
import { FollowToggle } from "@/components/mobile/FollowToggle";
import { flagFor } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TeamDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const team = await getTeam(id);
  if (!team) notFound();

  const [league, upcoming, results, rating, players, form, factors, follows] = await Promise.all([
    team.league_id ? getLeague(team.league_id) : Promise.resolve(null),
    upcomingForTeams([id], 10),
    recentResultsForTeams([id], 12),
    latestRatingForTeam(id),
    playersOnTeam(id),
    formLast5(id),
    factorsForTeam(id),
    listFollows(),
  ]);
  const followed = follows.some(f => f.entity_type === "team" && f.entity_id === id);

  const overall = rating?.overall != null
    ? Math.max(0, Math.min(99, Math.round(50 + Number(rating.overall) * 25)))
    : null;

  return (
    <div>
      <ScreenHeader
        eyebrow={team.is_national ? "National team" : league?.name ?? ""}
        title={<span>{flagFor(team.name)} {team.name}</span>}
        right={<FollowToggle entityType="team" entityId={id} initialFollowed={followed} />}
      />
      <TeamClient
        team={JSON.parse(JSON.stringify(team))}
        rating={rating ? { att: Number(rating.attack ?? 1), def: Number(rating.defense ?? 1), overall } : null}
        form={form}
        factors={factors}
        players={JSON.parse(JSON.stringify(players))}
        upcoming={JSON.parse(JSON.stringify(upcoming))}
        results={JSON.parse(JSON.stringify(results))}
        followedTeamIds={[id]}
      />
    </div>
  );
}

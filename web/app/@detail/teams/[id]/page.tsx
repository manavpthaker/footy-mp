import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Pad, eyebrow } from "@/components/mobile/primitives";
// @ts-ignore
import { SectionHeading } from "@/components/ds";
import { TeamClient } from "./TeamClient";
import {
  getTeam, getLeague, upcomingForTeams, recentResultsForTeams,
  latestRatingForTeam, playersOnTeam, formLast5, factorsForTeam,
  listFollows, keyPlayerIds, squadByNationality, squadByClub, countriesByIds,
} from "@/lib/data";
import { newsForTeam } from "@/lib/news";
import { NewsList } from "@/components/ds/NewsList";
import { Crest } from "@/components/ds/Crest";
import { FollowToggle } from "@/components/mobile/FollowToggle";
import { flagFor } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const t = await getTeam(Number(params.id));
  return { title: t ? t.name : "Team" };
}

export default async function TeamDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const team = await getTeam(id);
  if (!team) notFound();

  const [league, upcoming, results, rating, players, form, factors, follows, keyIds, nationalities, ntSquad, news] = await Promise.all([
    team.league_id ? getLeague(team.league_id) : Promise.resolve(null),
    upcomingForTeams([id], 10),
    recentResultsForTeams([id], 12),
    latestRatingForTeam(id),
    playersOnTeam(id),
    formLast5(id),
    factorsForTeam(id),
    listFollows(),
    keyPlayerIds(id),
    team.is_national ? Promise.resolve([]) : squadByNationality(id),
    team.is_national && team.country_id ? squadByClub(team.country_id) : Promise.resolve([]),
    newsForTeam(team.name, 6),
  ]);
  const followed = follows.some(f => f.entity_type === "team" && f.entity_id === id);
  const playerCountries = await countriesByIds(
    players.map(p => p.country_id).filter((x): x is number => x != null));

  const overall = rating?.overall != null
    ? Math.max(0, Math.min(99, Math.round(50 + Number(rating.overall) * 25)))
    : null;

  return (
    <div>
      <ScreenHeader
        eyebrow={team.is_national ? "National team" : league?.name ?? ""}
        title={<span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <Crest team={team} size={20} /> {team.name}
        </span>}
        right={<FollowToggle entityType="team" entityId={id} initialFollowed={followed} />}
      />
      <TeamClient
        team={JSON.parse(JSON.stringify(team))}
        rating={rating ? { att: Number(rating.attack ?? 1), def: Number(rating.defense ?? 1), overall } : null}
        form={form}
        factors={factors}
        players={JSON.parse(JSON.stringify(players))}
        playerCountryNames={JSON.parse(JSON.stringify(Object.fromEntries(
          players.filter(p => p.country_id != null && playerCountries[p.country_id!])
            .map(p => [p.id, playerCountries[p.country_id!].name]))))}
        keyPlayerIds={keyIds}
        upcoming={JSON.parse(JSON.stringify(upcoming))}
        results={JSON.parse(JSON.stringify(results))}
        followedTeamIds={[id]}
      />

      {/* What's being said — trades, injuries, drama around this team */}
      {news.length > 0 && (
        <Pad>
          <SectionHeading tick="var(--accent)">In the news</SectionHeading>
          <NewsList items={news} />
        </Pad>
      )}

      {/* The ecosystem angle: who this squad answers to internationally… */}
      {nationalities.length > 0 && (
        <Pad>
          <SectionHeading tick="var(--gold)">National teams fed</SectionHeading>
          <div style={{ ...eyebrow, margin: "0 2px 8px" }}>
            when internationals roll around, this is where the squad scatters to
          </div>
          {nationalities.map(g => (
            <Link key={g.country.id} href={`/countries/${g.country.id}`} style={{
              display: "flex", alignItems: "center", gap: 9, textDecoration: "none",
              color: "inherit", background: "var(--surface-panel)",
              border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
              padding: "8px 11px", marginBottom: 6,
            }}>
              <span style={{ fontSize: 15 }}>{flagFor(g.country.name, g.country.fifa_code)}</span>
              <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{g.country.name}</span>
              <span style={{
                fontSize: "var(--fs-xs)", color: "var(--text-muted)", flex: 1,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{g.players.map(p => p.name).join(" · ")}</span>
              <span style={{ ...eyebrow }}>{g.players.length}</span>
            </Link>
          ))}
        </Pad>
      )}

      {/* …or, for a national team, where its player pool earns its living */}
      {ntSquad.length > 0 && (
        <Pad>
          <SectionHeading tick="var(--gold)">Where the squad plays</SectionHeading>
          <div style={{ ...eyebrow, margin: "0 2px 8px" }}>
            follow these clubs through the season and you&apos;re scouting {team.name}
          </div>
          {ntSquad.map((g, i) => (
            <div key={g.club?.id ?? `u-${i}`} style={{
              display: "flex", alignItems: "baseline", gap: 8,
              background: "var(--surface-panel)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)", padding: "8px 11px", marginBottom: 6,
            }}>
              {g.club
                ? <Link href={`/teams/${g.club.id}`} style={{
                    fontWeight: 700, fontSize: "var(--fs-sm)", color: "inherit", textDecoration: "none",
                  }}>{g.club.name}</Link>
                : <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--text-muted)" }}>Club untracked</span>}
              <span style={{
                fontSize: "var(--fs-xs)", color: "var(--text-muted)", flex: 1,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{g.players.map(p => p.name).join(" · ")}</span>
              <span style={eyebrow}>{g.players.length}</span>
            </div>
          ))}
        </Pad>
      )}
    </div>
  );
}

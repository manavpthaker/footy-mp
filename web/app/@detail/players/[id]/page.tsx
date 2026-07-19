import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Pad, eyebrow, mono } from "@/components/mobile/primitives";
// @ts-ignore
import { SectionHeading } from "@/components/ds";
// @ts-ignore
import { StatCard } from "@/components/ds";
import { FollowToggle } from "@/components/mobile/FollowToggle";
import { getPlayer, getTeam, getCountry, listFollows, playerStatBlocks, PlayerAgg } from "@/lib/data";
import { newsForPlayer } from "@/lib/news";
import { NewsList } from "@/components/ds/NewsList";
import { Crest } from "@/components/ds/Crest";
import { flagFor, competitionCode } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const p = await getPlayer(Number(params.id));
  return { title: p ? p.name : "Player" };
}

const fmt1 = (x: number) => (Math.round(x * 10) / 10).toFixed(1);

export default async function PlayerDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const player = await getPlayer(id);
  if (!player) notFound();
  const [team, country, follows, blocks] = await Promise.all([
    player.team_id ? getTeam(player.team_id) : Promise.resolve(null),
    player.country_id ? getCountry(player.country_id) : Promise.resolve(null),
    listFollows(),
    playerStatBlocks(id),
  ]);
  const followed = follows.some(f => f.entity_type === "player" && f.entity_id === id);
  const news = await newsForPlayer(player.name, team?.name ?? country?.name);
  const { season, worldCup, log } = blocks;

  return (
    <div>
      <ScreenHeader
        eyebrow={`${player.position ?? ""} · ${country?.name ?? ""}`}
        title={<span>{flagFor(country?.name, country?.fifa_code)} {player.name}</span>}
        right={<FollowToggle entityType="player" entityId={id} initialFollowed={followed} />}
      />
      <Pad style={{ paddingTop: 14 }}>
        {team && (
          <Link href={`/teams/${team.id}`} style={{
            display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit",
            background: "var(--surface-panel)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)", padding: "11px 13px",
          }}>
            {player.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={player.photo_url} alt="" width={40} height={40}
                style={{ borderRadius: "50%", objectFit: "cover", background: "var(--surface-tint)" }} />
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={eyebrow}>club</div>
              <div style={{
                fontWeight: 700, fontSize: "var(--fs-h2)", marginTop: 2,
                display: "flex", alignItems: "center", gap: 7,
              }}><Crest team={team} size={18} /> {team.name}</div>
            </div>
            <span style={{ color: "var(--accent-2)", fontSize: 16 }}>›</span>
          </Link>
        )}

        {worldCup && (
          <>
            <SectionHeading tick="var(--gold)">World Cup 2026</SectionHeading>
            <AggGrid agg={worldCup} />
          </>
        )}

        <SectionHeading tick="var(--accent-2)">Season</SectionHeading>
        {season ? (
          <AggGrid agg={season} lead />
        ) : (
          <div style={{ ...eyebrow, padding: "4px 2px 8px" }}>
            no league match data for this player yet — big-5 club players fill in
            as the Understat player backfill lands
          </div>
        )}

        {log.length > 0 && (
          <>
            <SectionHeading tick="var(--accent-2)">Match log</SectionHeading>
            <div style={{
              background: "var(--surface-panel)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)", padding: "4px 12px",
            }}>
              {log.map(l => (
                <Link key={`${l.matchId}`} href={`/matches/${l.matchId}`} style={{
                  display: "flex", alignItems: "baseline", gap: 8,
                  padding: "8px 0", textDecoration: "none", color: "inherit",
                  borderBottom: "1px solid var(--border)",
                }}>
                  <span style={{ ...mono, fontSize: "var(--fs-xs)", color: "var(--text-faint)", width: 74 }}>
                    {l.date.slice(5)} {l.competition ? `· ${competitionCode(l.competition)}` : ""}
                  </span>
                  <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600, minWidth: 0, flex: 1,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {l.home ? "vs" : "@"} {l.opponent}
                  </span>
                  <span style={{ ...mono, fontSize: "var(--fs-xs)" }}>
                    {l.goals ?? 0}G {l.assists ?? 0}A {l.minutes ?? 0}′
                    {l.xg != null && Number(l.xg) > 0 ? ` · ${fmt1(Number(l.xg))} xG` : ""}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}

        {news.length > 0 && (
          <>
            <SectionHeading tick="var(--accent)">In the news</SectionHeading>
            <NewsList items={news} />
          </>
        )}

        <div style={{ height: 16 }} />
      </Pad>
    </div>
  );
}

function AggGrid({ agg, lead = false }: { agg: PlayerAgg; lead?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
      <StatCard label="G+A" value={`${agg.goals + agg.assists}`}
        accent={lead ? "var(--accent)" : undefined} style={{ padding: "10px 11px" }} />
      <StatCard label="xG" value={fmt1(agg.xg)} style={{ padding: "10px 11px" }} />
      <StatCard label="xA" value={fmt1(agg.xa)} style={{ padding: "10px 11px" }} />
      <StatCard label="mins" value={`${agg.minutes}`} style={{ padding: "10px 11px" }} />
    </div>
  );
}

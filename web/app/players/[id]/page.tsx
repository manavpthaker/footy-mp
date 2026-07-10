import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Pad, eyebrow } from "@/components/mobile/primitives";
// @ts-ignore
import { SectionHeading } from "@/components/ds";
// @ts-ignore
import { StatCard } from "@/components/ds";
import { FollowToggle } from "@/components/mobile/FollowToggle";
import { getPlayer, getTeam, getCountry, listFollows } from "@/lib/data";
import { flagFor } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PlayerDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const player = await getPlayer(id);
  if (!player) notFound();
  const [team, country, follows] = await Promise.all([
    player.team_id ? getTeam(player.team_id) : Promise.resolve(null),
    player.country_id ? getCountry(player.country_id) : Promise.resolve(null),
    listFollows(),
  ]);
  const followed = follows.some(f => f.entity_type === "player" && f.entity_id === id);

  return (
    <div>
      <ScreenHeader
        eyebrow={`${player.position ?? ""} · ${country?.name ?? ""}`}
        title={<span>{flagFor(undefined, country?.fifa_code)} {player.name}</span>}
        right={<FollowToggle entityType="player" entityId={id} initialFollowed={followed} />}
      />
      <Pad style={{ paddingTop: 14 }}>
        {team && (
          <Link href={`/teams/${team.id}`} style={{
            display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit",
            background: "var(--surface-panel)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)", padding: "11px 13px",
          }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={eyebrow}>club</div>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-h2)", marginTop: 2 }}>{team.name}</div>
            </div>
            <span style={{ color: "var(--accent-2)", fontSize: 16 }}>›</span>
          </Link>
        )}

        <SectionHeading tick="var(--gold)">World Cup 2026</SectionHeading>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
          <StatCard label="goals" value="—" style={{ padding: "10px 11px" }} />
          <StatCard label="assists" value="—" style={{ padding: "10px 11px" }} />
          <StatCard label="xG" value="—" style={{ padding: "10px 11px" }} />
          <StatCard label="mins" value="—" style={{ padding: "10px 11px" }} />
        </div>

        <SectionHeading tick="var(--accent-2)">Season</SectionHeading>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
          <StatCard label="G+A" value="—" accent="var(--accent)" style={{ padding: "10px 11px" }} />
          <StatCard label="xG" value="—" style={{ padding: "10px 11px" }} />
          <StatCard label="xA" value="—" style={{ padding: "10px 11px" }} />
          <StatCard label="mins" value="—" style={{ padding: "10px 11px" }} />
        </div>

        <div style={{ ...eyebrow, textAlign: "center", padding: "18px 0 6px" }}>
          match-level stats land once the FBref player backfill runs
        </div>
        <div style={{ height: 16 }} />
      </Pad>
    </div>
  );
}

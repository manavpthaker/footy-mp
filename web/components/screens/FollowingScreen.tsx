import React from "react";
import Link from "next/link";
import { Pad, eyebrow } from "@/components/mobile/primitives";
// @ts-ignore
import { SectionHeading } from "@/components/ds";
// @ts-ignore
import { StatCard } from "@/components/ds";
import { FollowToggle } from "@/components/mobile/FollowToggle";
import { loadFollowedEntities } from "@/lib/data";
import { flagFor } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function FollowingPage() {
  const { players, teams, leagues, countries } = await loadFollowedEntities();

  return (
    <div>
      
      <Pad style={{ paddingTop: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          <StatCard label="players" value={players.length}
            accent={players.length > 0 ? "var(--follow)" : "var(--text-faint)"} />
          <StatCard label="teams" value={teams.length}
            accent={teams.length > 0 ? "var(--follow)" : "var(--text-faint)"} />
          <StatCard label="leagues" value={leagues.length}
            accent={leagues.length > 0 ? "var(--follow)" : "var(--text-faint)"} />
        </div>

        <div className="">
          {players.length > 0 && (
            <div>
              <SectionHeading tick="var(--gold)">Players</SectionHeading>
              {players.map(p => (
                <Row key={p.id} href={`/players/${p.id}`}
                  icon={flagFor(undefined, "COL")}
                  name={p.name}
                  meta={p.position ?? "—"}
                  followEntity="player" followId={p.id} />
              ))}
            </div>
          )}

          {teams.length > 0 && (
            <div>
              <SectionHeading tick="var(--gold)">Teams</SectionHeading>
              {teams.map(t => (
                <Row key={t.id} href={`/teams/${t.id}`}
                  icon={flagFor(t.name)}
                  name={t.name}
                  meta={t.is_national ? "National team" : ""}
                  followEntity="team" followId={t.id} />
              ))}
            </div>
          )}

          {leagues.length > 0 && (
            <div>
              <SectionHeading tick="var(--gold)">Leagues</SectionHeading>
              {leagues.map(l => (
                <Row key={l.id} href={`/leagues/${l.id}`}
                  icon={"🏆"}
                  name={l.name}
                  meta={l.is_international ? "International" : ""}
                  followEntity="league" followId={l.id} />
              ))}
            </div>
          )}
        </div>

        {countries.length > 0 && (
          <>
            <SectionHeading tick="var(--gold)">Countries</SectionHeading>
            {countries.map(c => (
              <Row key={c.id} href={`/leagues/`}
                icon={flagFor(c.name, c.fifa_code ?? undefined)}
                name={c.name}
                meta={c.confederation ?? ""}
                followEntity="country" followId={c.id} />
            ))}
          </>
        )}

        {players.length + teams.length + leagues.length + countries.length === 0 && (
          <div style={{ ...eyebrow, textAlign: "center", padding: "22px 0" }}>
            Nothing followed yet — hit ★ on any team, league, or player.
          </div>
        )}
        <div style={{ height: 8 }} />
      </Pad>
    </div>
  );
}

function Row({ href, icon, name, meta, followEntity, followId }: {
  href: string; icon: string; name: string; meta: string;
  followEntity: "player" | "team" | "league" | "country"; followId: number;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 9,
      background: "var(--surface-panel)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: "9px 11px", marginBottom: 6,
    }}>
      <Link href={href} style={{
        display: "flex", alignItems: "center", gap: 9, minWidth: 0, flex: 1,
        textDecoration: "none", color: "inherit",
      }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{name}</div>
          {meta && <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-faint)" }}>{meta}</div>}
        </div>
      </Link>
      <FollowToggle entityType={followEntity} entityId={followId} initialFollowed={true} label={false} />
    </div>
  );
}

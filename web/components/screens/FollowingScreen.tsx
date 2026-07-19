import React from "react";
import Link from "next/link";
import { Pad, eyebrow } from "@/components/mobile/primitives";
// @ts-ignore
import { SectionHeading } from "@/components/ds";
// @ts-ignore
import { StatCard } from "@/components/ds";
import { Crest } from "@/components/ds/Crest";
import { FixtureItem } from "@/components/mobile/FixtureItem";
import { FollowToggle } from "@/components/mobile/FollowToggle";
import {
  loadFollowedEntities, countriesByIds, teamsByIds, leaguesByIds,
  upcomingForTeams, recentMovements,
} from "@/lib/data";
import { flagFor } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * Following — your slice of the football world in one screen:
 *   1. the next matches your teams play (the "when do I care" answer),
 *   2. movement (transfers / promotions) touching what you follow,
 *   3. the roster of everything followed, grouped by kind, each row showing
 *      enough context (club, league, position) to stand alone.
 */
export default async function FollowingPage() {
  const { players, teams, leagues, countries } = await loadFollowedEntities();

  const followedTeamIds = teams.map(t => t.id);
  const [playerCountries, playerClubs, teamLeagues, nextUp, movements] = await Promise.all([
    countriesByIds(players.map(p => p.country_id).filter((x): x is number => x != null)),
    teamsByIds(players.map(p => p.team_id)),
    leaguesByIds(teams.map(t => t.league_id)),
    upcomingForTeams(followedTeamIds, 6),
    recentMovements(20),
  ]);

  const followedPlayerIds = new Set(players.map(p => p.id));
  const followedTeamIdSet = new Set(followedTeamIds);
  const relevantMoves = movements.filter(mv =>
    (mv.player_id != null && followedPlayerIds.has(mv.player_id))
    || [mv.team_id, mv.from_team_id, mv.to_team_id]
      .some(t => t != null && followedTeamIdSet.has(t))).slice(0, 8);

  const total = players.length + teams.length + leagues.length + countries.length;

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

        {nextUp.length > 0 && (
          <>
            <SectionHeading tick="var(--accent)">Next up for you</SectionHeading>
            {nextUp.map(m => (
              <FixtureItem key={m.id} m={m} followedTeamIds={followedTeamIdSet} />
            ))}
          </>
        )}

        {relevantMoves.length > 0 && (
          <>
            <SectionHeading tick="var(--gold)">Movement</SectionHeading>
            {relevantMoves.map(mv => (
              <div key={mv.id} style={{
                background: "var(--surface-panel)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)", padding: "8px 11px", marginBottom: 6,
              }}>
                <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>
                  {mv.kind === "transfer" && mv.player
                    ? `${mv.player.name}: ${mv.from_team?.name ?? "?"} → ${mv.to_team?.name ?? "?"}`
                    : mv.note ?? "Movement"}
                </div>
                <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-faint)", marginTop: 2 }}>
                  {mv.kind === "transfer" ? "transfer" : "league change"}
                  {" · "}{(mv.noticed_at ?? "").slice(0, 10)}
                </div>
              </div>
            ))}
          </>
        )}

        {teams.length > 0 && (
          <>
            <SectionHeading tick="var(--follow)">Teams</SectionHeading>
            {teams.map(t => (
              <Row key={t.id} href={`/teams/${t.id}`}
                icon={<Crest team={t} size={18} />}
                name={t.name}
                meta={t.is_national
                  ? "National team"
                  : (t.league_id != null && teamLeagues[t.league_id]?.name) || "Club"}
                followEntity="team" followId={t.id} />
            ))}
          </>
        )}

        {players.length > 0 && (
          <>
            <SectionHeading tick="var(--follow)">Players</SectionHeading>
            {players.map(p => {
              const c = p.country_id ? playerCountries[p.country_id] : undefined;
              const club = p.team_id ? playerClubs[p.team_id] : undefined;
              return (
                <Row key={p.id} href={`/players/${p.id}`}
                  icon={p.photo_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.photo_url} alt="" width={20} height={20}
                        style={{ borderRadius: "50%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 15 }}>{flagFor(c?.name, c?.fifa_code)}</span>}
                  name={p.name}
                  meta={[p.position, club?.name, c?.name].filter(Boolean).join(" · ") || "—"}
                  followEntity="player" followId={p.id} />
              );
            })}
          </>
        )}

        {leagues.length > 0 && (
          <>
            <SectionHeading tick="var(--follow)">Leagues</SectionHeading>
            {leagues.map(l => (
              <Row key={l.id} href={`/leagues/${l.id}`}
                icon={<span style={{ fontSize: 15 }}>🏆</span>}
                name={l.name}
                meta={l.is_international ? "International" : "Domestic"}
                followEntity="league" followId={l.id} />
            ))}
          </>
        )}

        {countries.length > 0 && (
          <>
            <SectionHeading tick="var(--follow)">Countries</SectionHeading>
            {countries.map(c => (
              <Row key={c.id} href={`/countries/${c.id}`}
                icon={<span style={{ fontSize: 15 }}>{flagFor(c.name, c.fifa_code ?? undefined)}</span>}
                name={c.name}
                meta={c.confederation ?? ""}
                followEntity="country" followId={c.id} />
            ))}
          </>
        )}

        {total === 0 && (
          <div style={{ textAlign: "center", padding: "26px 12px" }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>★</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Nothing followed yet</div>
            <div style={{ ...eyebrow, marginBottom: 14 }}>
              hit ★ on any team, league, or player and it lands here — with its
              fixtures, transfers, and news
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <Link href="/tables" style={pillStyle}>Browse tables</Link>
              <Link href="/matches" style={pillStyle}>Browse matches</Link>
            </div>
          </div>
        )}
        <div style={{ height: 8 }} />
      </Pad>
    </div>
  );
}

const pillStyle: React.CSSProperties = {
  padding: "7px 13px", borderRadius: "var(--radius-lg)",
  border: "1px solid var(--border)", background: "var(--surface-panel)",
  fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--accent-2)",
};

function Row({ href, icon, name, meta, followEntity, followId }: {
  href: string; icon: React.ReactNode; name: string; meta: string;
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
        <span style={{ display: "inline-flex", width: 20, justifyContent: "center" }}>{icon}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{name}</div>
          {meta && <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-faint)" }}>{meta}</div>}
        </div>
      </Link>
      <FollowToggle entityType={followEntity} entityId={followId} initialFollowed={true} label={false} />
    </div>
  );
}

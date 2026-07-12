import React from "react";
import Link from "next/link";
import { Pad, EmptyState, eyebrow, mono } from "@/components/mobile/primitives";
import { FixtureItem } from "@/components/mobile/FixtureItem";
// @ts-ignore
import { SectionHeading } from "@/components/ds";
// @ts-ignore
import { ProbabilityBar } from "@/components/ds";
// @ts-ignore
import { CompetitionBadge } from "@/components/ds";
// @ts-ignore
import { PlayerStatRow } from "@/components/ds";
import {
  loadFollowedEntities, upcomingForTeams, recentResultsForTeams,
  liveMatches, upcomingAll, MODEL_VERSION,
} from "@/lib/data";
import { flagFor, competitionCode, competitionTone } from "@/lib/format";
import type { RichMatch } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TodayScreen() {
  const { players, teams, leagues, countries } = await loadFollowedEntities();
  const followedTeamIds = new Set<number>(teams.map(t => t.id));
  players.forEach(p => p.team_id && followedTeamIds.add(p.team_id));

  const [live, allUpcoming, yoursUpcoming, yoursResults] = await Promise.all([
    liveMatches(),
    upcomingAll(60),
    upcomingForTeams(Array.from(followedTeamIds), 20),
    recentResultsForTeams(Array.from(followedTeamIds), 6),
  ]);
  const yours = yoursUpcoming.filter(m => m.status === "scheduled");
  const wcKnockout = allUpcoming
    .filter(m => m.league?.name === "World Cup" && !isFollowed(m, followedTeamIds))
    .slice(0, 3);

  return (
    <div>
      
      <Pad style={{ paddingTop: 12 }}>
        <div className="">
          {/* Left / main column: hero + your matches */}
          <div>
            {yours.length > 0 && <NextMatchCard m={yours[0]} followedTeamIds={followedTeamIds} />}
            {live.map(m => <LiveHeroCard key={m.id} m={m} />)}

            <SectionHeading tick="var(--gold)">Next up for you</SectionHeading>
            {yours.length > 1
              ? yours.slice(1, 5).map(m => (
                  <FixtureItem key={m.id} m={m} followedTeamIds={followedTeamIds} />
                ))
              : yours.length === 0
                ? <EmptyState>No upcoming fixtures for anyone you follow.</EmptyState>
                : <div style={{ ...eyebrow, margin: "0 2px 4px" }}>
                    that's everything scheduled — more land after the WC final
                  </div>}

            {yoursResults.length > 0 && (
              <>
                <SectionHeading
                  trailing={<Link href="/matches" style={{
                    color: "var(--accent-2)", fontSize: "var(--fs-xs)",
                  }}>all →</Link>}
                >Just in</SectionHeading>
                {yoursResults.slice(0, 4).map(m => (
                  <FixtureItem key={m.id} m={m} followedTeamIds={followedTeamIds} />
                ))}
              </>
            )}
          </div>

          {/* Right / sidebar column: cup + players */}
          <div>
            {wcKnockout.length > 0 && (
              <>
                <SectionHeading
                  tick="var(--accent-2)"
                  trailing={<Link href="/matches" style={{
                    color: "var(--accent-2)", fontSize: "var(--fs-xs)",
                  }}>all →</Link>}
                >World Cup · knockouts</SectionHeading>
                {wcKnockout.map(m => <FixtureItem key={m.id} m={m} followedTeamIds={followedTeamIds} />)}
              </>
            )}

            {players.length > 0 && (
              <>
                <SectionHeading tick="var(--gold)">Your players</SectionHeading>
                {players.map(p => <PlayerRow key={p.id} p={p} />)}
              </>
            )}
          </div>
        </div>

        <div style={{
          ...eyebrow, textAlign: "center", padding: "14px 0 6px",
        }}>xG Dixon-Coles on real shot data · not betting advice</div>
      </Pad>
    </div>
  );
}

function isFollowed(m: RichMatch, ids: Set<number>) {
  return ids.has(m.home_team_id) || ids.has(m.away_team_id);
}

/* ============ Hero cards ============ */

function NextMatchCard({ m, followedTeamIds }: { m: RichMatch; followedTeamIds: Set<number> }) {
  const kick = new Date(m.kickoff_utc);
  const now = new Date();
  const days = Math.round((kick.getTime() - now.getTime()) / 864e5);
  const when = days <= 0 ? "TODAY" : days === 1 ? "TOMORROW" : `IN ${days} DAYS`;
  const home = m.home_team; const away = m.away_team;
  const comp = m.league?.name ?? "";
  const pred = m.prediction;
  return (
    <Link href={`/matches/${m.id}`} style={{
      display: "block", textDecoration: "none", color: "inherit",
      background: "var(--surface-panel)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-2xl)", padding: "12px 14px 13px",
      boxShadow: "inset 3px 0 0 var(--follow)", marginBottom: 7,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
        <span style={{ ...eyebrow, color: "var(--follow)" }}>your next match · {when}</span>
        <div style={{ flex: 1 }} />
        {comp && <CompetitionBadge code={competitionCode(comp)} tone={competitionTone(comp)} />}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8 }}>
        <TeamCol name={home?.name ?? "TBD"} teamId={m.home_team_id} followedTeamIds={followedTeamIds} />
        <div style={{ textAlign: "center" }}>
          <div style={{
            ...mono, fontSize: "var(--fs-h2)", fontWeight: 700,
          }}>{kick.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</div>
          <div style={{ ...eyebrow, marginTop: 2 }}>
            {kick.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}
          </div>
        </div>
        <TeamCol name={away?.name ?? "TBD"} teamId={m.away_team_id} followedTeamIds={followedTeamIds} />
      </div>
      {pred && pred.p_home != null && (
        <div style={{ marginTop: 10 }}>
          <ProbabilityBar
            home={Math.round(Number(pred.p_home) * 100)}
            draw={Math.round(Number(pred.p_draw ?? 0) * 100)}
            away={100 - Math.round(Number(pred.p_home) * 100) - Math.round(Number(pred.p_draw ?? 0) * 100)}
            height={18}
          />
          <div style={{
            ...eyebrow, marginTop: 5, display: "flex", justifyContent: "space-between",
          }}>
            <span>{comp}</span>
            <span style={{ color: "var(--accent-2)" }}>preview →</span>
          </div>
        </div>
      )}
    </Link>
  );
}

function LiveHeroCard({ m }: { m: RichMatch }) {
  const home = m.home_team; const away = m.away_team;
  const comp = m.league?.name ?? "";
  const pred = m.prediction;
  return (
    <Link href={`/matches/${m.id}`} style={{
      display: "block", textDecoration: "none", color: "inherit",
      background: "var(--surface-panel)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-2xl)", padding: "13px 14px 14px",
      boxShadow: "inset 3px 0 0 var(--status-live)", marginBottom: 7,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        {comp && <CompetitionBadge code={competitionCode(comp)} name={comp} tone="gold" />}
        <div style={{ flex: 1 }} />
        <span style={{
          ...mono, fontSize: "var(--fs-xs)",
          color: "var(--status-live)", fontWeight: 700,
        }}>● LIVE {m.minute ?? 0}′</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 10 }}>
        <TeamHero name={home?.name ?? "TBD"} />
        <div style={{
          ...mono, fontSize: 30, fontWeight: 700, lineHeight: 1, color: "var(--status-live)",
        }}>{m.home_goals ?? 0}–{m.away_goals ?? 0}</div>
        <TeamHero name={away?.name ?? "TBD"} />
      </div>
      {pred && pred.p_home != null && (
        <div style={{ marginTop: 12 }}>
          <ProbabilityBar
            home={Math.round(Number(pred.p_home) * 100)}
            draw={Math.round(Number(pred.p_draw ?? 0) * 100)}
            away={100 - Math.round(Number(pred.p_home) * 100) - Math.round(Number(pred.p_draw ?? 0) * 100)}
            height={24}
          />
          <div style={{
            ...eyebrow, marginTop: 6, display: "flex", justifyContent: "space-between",
          }}>
            <span>pre-match · mpfc v1</span>
            <span style={{ color: "var(--accent-2)" }}>full read →</span>
          </div>
        </div>
      )}
    </Link>
  );
}

function TeamCol({ name, teamId, followedTeamIds }: {
  name: string; teamId: number; followedTeamIds: Set<number>;
}) {
  return (
    <div style={{ textAlign: "center", minWidth: 0 }}>
      <div style={{ fontSize: 24 }}>{flagFor(name)}</div>
      <div style={{
        fontWeight: 700, fontSize: "var(--fs-sm)",
        textTransform: "uppercase", letterSpacing: "0.03em", marginTop: 3,
      }}>{name}
        {followedTeamIds.has(teamId) && <span style={{ color: "var(--follow)", marginLeft: 4 }}>★</span>}
      </div>
    </div>
  );
}

function TeamHero({ name }: { name: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 26 }}>{flagFor(name)}</div>
      <div style={{
        fontWeight: 700, fontSize: "var(--fs-sm)",
        textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 3,
      }}>{name}</div>
    </div>
  );
}

function PlayerRow({ p }: { p: any }) {
  return (
    <Link href={`/players/${p.id}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <PlayerStatRow
        flag={flagFor(undefined, "COL")}
        name={p.name}
        meta={p.position ?? "—"}
        followed={true}
        figures={[
          { value: "—", label: "G" },
          { value: "—", label: "A" },
          { value: "—", label: "MIN" },
        ]}
      />
    </Link>
  );
}

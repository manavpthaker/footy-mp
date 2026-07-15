"use client";
import React from "react";
import { useRouter } from "next/navigation";
// @ts-ignore  — DS JSX with permissive prop types
import { MatchRow } from "@/components/ds";
import { MiniProb, mono } from "./primitives";
import { isPlaceholderTeam } from "@/lib/format";
import type { RichMatch } from "@/lib/data";

/**
 * One fixture line, tuned for mobile. Composes DS MatchRow with:
 *   - stacked date/time + comp code on the left
 *   - team names with gold ★ suffix when followed
 *   - right readout: score (final) / live pulse (live) / MiniProb bar (scheduled).
 */
export function FixtureItem({
  m, followedTeamIds, showComp = true,
}: {
  m: RichMatch;
  followedTeamIds?: Set<number>;
  showComp?: boolean;
}) {
  const router = useRouter();
  const isFinal = m.status === "final";
  const isLive = m.status === "live";
  const kick = new Date(m.kickoff_utc);
  const followedH = followedTeamIds?.has(m.home_team_id) ?? false;
  const followedA = followedTeamIds?.has(m.away_team_id) ?? false;
  const followed = followedH || followedA;

  const dateEl = (
    <span>
      {isFinal ? "FT"
        : isLive ? <span style={{ color: "var(--status-live)", fontWeight: 700 }}>LIVE</span>
        : <>
            <span>{kick.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
            <br />
            <span>{kick.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
          </>}
      {showComp && m.league && (
        <>
          <br />
          <span style={{ color: "var(--text-faint)" }}>{compCode(m.league.name)}</span>
        </>
      )}
    </span>
  );

  const homeTeam = m.home_team?.name ?? "TBD";
  const awayTeam = m.away_team?.name ?? "TBD";
  const homeEl = (
    <span>
      {homeTeam}
      {followedH && <span style={{ color: "var(--follow)", marginLeft: 4, fontSize: "var(--fs-xs)" }}>★</span>}
    </span>
  );
  const awayEl = (
    <span>
      {awayTeam}
      {followedA && <span style={{ color: "var(--follow)", marginLeft: 4, fontSize: "var(--fs-xs)" }}>★</span>}
    </span>
  );

  const right = isFinal ? (
    <div style={{ textAlign: "right" }}>
      <span style={{ ...mono, fontSize: "var(--fs-h2)", fontWeight: 700 }}>
        {m.home_goals}–{m.away_goals}
      </span>
      {m.went_pens && (
        <div style={{ ...mono, fontSize: "var(--fs-micro)", color: "var(--text-muted)" }}>
          {m.pens_home}–{m.pens_away} pens
        </div>
      )}
    </div>
  ) : isLive ? (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
      <span style={{ ...mono, fontSize: "var(--fs-h2)", fontWeight: 700, color: "var(--status-live)" }}>
        {m.home_goals ?? 0}–{m.away_goals ?? 0}
      </span>
      <span style={{ ...mono, fontSize: "var(--fs-micro)", color: "var(--status-live)", fontWeight: 700 }}>
        ● {m.minute ?? 0}′
      </span>
    </div>
  ) : m.prediction && m.prediction.p_home != null
      && !isPlaceholderTeam(homeTeam) && !isPlaceholderTeam(awayTeam) ? (
    <MiniProb pred={{
      h: Number(m.prediction.p_home),
      d: Number(m.prediction.p_draw ?? 0),
      a: Number(m.prediction.p_away ?? 0),
    }} />
  ) : (
    <span style={{ ...mono, fontSize: "var(--fs-xs)", color: "var(--text-faint)" }}>—</span>
  );

  return (
    <MatchRow
      date={dateEl}
      home={homeEl}
      away={awayEl}
      right={right}
      onClick={() => router.push(`/matches/${m.id}`)}
      style={followed ? { boxShadow: "inset 3px 0 0 var(--follow)" } : {}}
    />
  );
}

// Map a league name to a short competition code for the left-column tail.
function compCode(name: string): string {
  if (name === "World Cup") return "WC";
  if (name === "Premier League") return "PL";
  if (name === "La Liga") return "LL";
  if (name === "Serie A") return "SA";
  if (name === "Bundesliga") return "BL";
  if (name === "Ligue 1") return "L1";
  if (name === "Champions League") return "CL";
  if (name === "Europa League") return "EL";
  if (name === "Liga MX") return "MX";
  if (name === "Primeira Liga") return "LP";
  return name.slice(0, 2).toUpperCase();
}

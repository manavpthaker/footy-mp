import Link from "next/link";
import React from "react";
import type { RichMatch } from "@/lib/data";

/**
 * One line per match. Left: date + home/away. Right: score (if final)
 * or model p_home / p_draw / p_away (if scheduled).
 * Gold ★ marker if either team is in the followed set.
 */
export function MatchRow({ match, followedTeamIds }: {
  match: RichMatch; followedTeamIds?: Set<number>;
}) {
  const isFollowed = followedTeamIds && (
    followedTeamIds.has(match.home_team_id) || followedTeamIds.has(match.away_team_id)
  );
  const isLive = match.status === "live";
  const isFinal = match.status === "final";
  const kickoff = new Date(match.kickoff_utc);
  const date = kickoff.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const time = kickoff.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return (
    <Link href={`/matches/${match.id}`} style={{
      display: "grid",
      gridTemplateColumns: "70px 1fr auto",
      gap: 10, padding: "9px 12px",
      borderRadius: "var(--radius-md)", background: "var(--surface-tint)",
      border: `1px solid ${isFollowed ? "rgba(255,206,83,0.25)" : "var(--border-soft)"}`,
      alignItems: "center", textDecoration: "none",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: "var(--fs-xs)",
        color: "var(--text-faint)", fontVariantNumeric: "tabular-nums",
      }}>
        {isFinal ? "FT" : isLive ? <span style={{ color: "var(--status-live)" }}>LIVE {match.minute}′</span> : (
          <><span>{date}</span><br /><span>{time}</span></>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <TeamLine name={match.home_team?.name ?? "TBD"} teamId={match.home_team_id}
                  followed={followedTeamIds?.has(match.home_team_id) ?? false} />
        <TeamLine name={match.away_team?.name ?? "TBD"} teamId={match.away_team_id}
                  followed={followedTeamIds?.has(match.away_team_id) ?? false} />
      </div>
      <div style={{ textAlign: "right", minWidth: 90 }}>
        {isFinal && (
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "var(--fs-stat)", fontWeight: 700,
            fontVariantNumeric: "tabular-nums", color: "var(--text-primary)",
          }}>
            {match.home_goals}–{match.away_goals}
            {match.went_pens && (
              <span style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", marginLeft: 4 }}>
                ({match.pens_home}–{match.pens_away} p)
              </span>
            )}
          </div>
        )}
        {!isFinal && match.prediction && (
          <ProbSpark p_home={match.prediction.p_home ?? 0}
                     p_draw={match.prediction.p_draw ?? 0}
                     p_away={match.prediction.p_away ?? 0} />
        )}
        {!isFinal && !match.prediction && (
          <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-faint)" }}>—</div>
        )}
      </div>
    </Link>
  );
}

function TeamLine({ name, teamId, followed }: { name: string; teamId: number; followed: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
      {followed && <span style={{ color: "var(--follow)", fontSize: 12 }}>★</span>}
      <span style={{
        fontSize: "var(--fs-body)", fontWeight: followed ? 700 : 500,
        color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}>{name}</span>
    </div>
  );
}

function ProbSpark({ p_home, p_draw, p_away }: { p_home: number; p_draw: number; p_away: number }) {
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 90 }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: `${p_home * 100}fr ${p_draw * 100}fr ${p_away * 100}fr`,
        height: 6, borderRadius: 3, overflow: "hidden",
      }}>
        <div style={{ background: "var(--accent)" }} title={`H ${pct(p_home)}`} />
        <div style={{ background: "var(--slate-500)" }} title={`D ${pct(p_draw)}`} />
        <div style={{ background: "var(--accent-2)" }} title={`A ${pct(p_away)}`} />
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between", gap: 4,
        fontFamily: "var(--font-mono)", fontSize: "var(--fs-2xs)",
        color: "var(--text-muted)", fontVariantNumeric: "tabular-nums",
      }}>
        <span style={{ color: p_home > Math.max(p_draw, p_away) ? "var(--accent)" : undefined }}>{pct(p_home)}</span>
        <span>{pct(p_draw)}</span>
        <span style={{ color: p_away > Math.max(p_home, p_draw) ? "var(--accent-2)" : undefined }}>{pct(p_away)}</span>
      </div>
    </div>
  );
}

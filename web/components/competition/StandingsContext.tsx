import React from "react";

interface StandingRow {
  team: string;
  Pts: number;
  P: number;
  zone: "ucl" | "uel" | "conf" | "releg" | null;
}

export function StandingsContext({
  leagueName,
  season,
  complete,
  rows,
}: {
  leagueName: string;
  season: string | null;
  complete: boolean;
  rows: StandingRow[];
}) {
  const leader = rows[0];
  const second = rows[1];
  const gap = leader && second ? leader.Pts - second.Pts : null;
  const relegation = rows.filter(row => row.zone === "releg");

  return (
    <div style={{
      borderBlock: "1px solid var(--border)", padding: "11px 0", marginBottom: 10,
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8,
      }}>
        <ContextItem label={complete ? "Final leader" : "Current leader"}
          value={leader?.team ?? "No table"}
          detail={leader ? `${leader.Pts} points` : leagueName} />
        <ContextItem label="Title gap"
          value={gap == null ? "—" : gap === 0 ? "Level" : `${gap} point${gap === 1 ? "" : "s"}`}
          detail={second ? `to ${second.team}` : "No comparison yet"} />
        <ContextItem label="Table state"
          value={complete ? "Final" : "In progress"}
          detail={[season, relegation.length ? `${relegation.length} relegation places` : null].filter(Boolean).join(" · ") || "Season not stamped"} />
      </div>
      <div style={{
        marginTop: 10, color: "var(--text-muted)", fontSize: "var(--fs-xs)", lineHeight: 1.55,
      }}>
        <b style={{ color: "var(--text-primary)" }}>Read the table:</b>{" "}
        P played · W wins · D draws · L losses · GD goal difference · Pts points.
        Three points for a win, one for a draw. Colored rails mark qualification and relegation zones.
      </div>
    </div>
  );
}

function ContextItem({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: "var(--fs-2xs)", color: "var(--text-faint)", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{
        marginTop: 3, fontWeight: 700, fontSize: "var(--fs-sm)",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{value}</div>
      <div style={{
        marginTop: 2, color: "var(--text-muted)", fontSize: "var(--fs-xs)",
        lineHeight: 1.35,
      }}>{detail}</div>
    </div>
  );
}

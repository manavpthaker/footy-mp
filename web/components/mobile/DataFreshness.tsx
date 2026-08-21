import React from "react";

export function DataFreshness({
  updatedAt,
  upcomingCount,
  latestResultAt,
}: {
  updatedAt?: string | null;
  upcomingCount: number;
  latestResultAt?: string | null;
}) {
  const ageHours = updatedAt
    ? Math.max(0, (Date.now() - new Date(updatedAt).getTime()) / 3_600_000)
    : null;
  const stale = ageHours == null || ageHours > 30;
  const lastResult = latestResultAt
    ? new Date(latestResultAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;

  let message: string;
  if (stale && updatedAt) {
    message = `Coverage warning: match data last changed ${relativeAge(ageHours!)} ago.`;
  } else if (!updatedAt) {
    message = "Coverage warning: no refresh timestamp is available.";
  } else if (upcomingCount === 0) {
    message = `Scores checked ${relativeAge(ageHours!)} ago, but no future fixtures are loaded${lastResult ? `; latest result is ${lastResult}` : ""}.`;
  } else {
    message = `Scores checked ${relativeAge(ageHours!)} ago · ${upcomingCount} future fixture${upcomingCount === 1 ? "" : "s"} loaded.`;
  }

  return (
    <div role="status" style={{
      display: "flex", alignItems: "center", gap: 8,
      margin: "0 0 12px", padding: "8px 10px",
      background: stale || upcomingCount === 0 ? "var(--surface-tint)" : "transparent",
      border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
      color: stale || upcomingCount === 0 ? "var(--gold)" : "var(--text-muted)",
      fontSize: "var(--fs-xs)", lineHeight: 1.45,
    }}>
      <span aria-hidden style={{
        width: 7, height: 7, borderRadius: "50%", flex: "0 0 auto",
        background: stale || upcomingCount === 0 ? "var(--gold)" : "var(--status-win)",
      }} />
      <span>{message}</span>
    </div>
  );
}

function relativeAge(hours: number): string {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}


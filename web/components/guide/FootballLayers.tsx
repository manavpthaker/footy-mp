import React from "react";
import Link from "next/link";

const LAYERS = [
  {
    step: "01",
    title: "Players",
    cadence: "Every match",
    body: "The people on the pitch. Their club form, role and availability travel with them into every competition.",
    href: "/map#players",
    color: "var(--follow)",
  },
  {
    step: "02",
    title: "Clubs",
    cadence: "Every week",
    body: "Permanent teams that employ players and compete through a full domestic season.",
    href: "/map#clubs",
    color: "var(--accent-2)",
  },
  {
    step: "03",
    title: "Competitions",
    cadence: "Season by season",
    body: "Leagues set the weekly rhythm. Cups connect clubs across countries and create knockout stakes.",
    href: "/map#competitions",
    color: "var(--accent)",
  },
  {
    step: "04",
    title: "National teams",
    cadence: "In short windows",
    body: "Countries temporarily call up those same players for qualifiers and tournaments on the road to 2030.",
    href: "/map#national-teams",
    color: "var(--gold)",
  },
] as const;

export function FootballLayers({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(auto-fit, minmax(${compact ? 132 : 150}px, 1fr))`,
      gap: 7,
    }}>
      {LAYERS.map((layer, index) => (
        <Link key={layer.title} href={layer.href} style={{
          display: "flex", flexDirection: "column", minHeight: compact ? 138 : 166,
          padding: compact ? "11px" : "13px", color: "inherit", textDecoration: "none",
          background: "var(--surface-panel)", border: "1px solid var(--border)",
          borderTop: `3px solid ${layer.color}`, borderRadius: "var(--radius-md)",
        }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "var(--fs-xs)",
            color: layer.color, fontWeight: 700,
          }}>{layer.step}</div>
          <div style={{ fontSize: "var(--fs-h2)", fontWeight: 700, marginTop: 5 }}>
            {layer.title}
          </div>
          <div style={{
            marginTop: 3, fontSize: "var(--fs-xs)", color: "var(--text-faint)",
          }}>{layer.cadence}</div>
          <div style={{
            marginTop: 8, fontSize: "var(--fs-sm)", color: "var(--text-muted)",
            lineHeight: 1.5, flex: 1,
          }}>{layer.body}</div>
          <div style={{
            marginTop: 8, color: layer.color, fontSize: "var(--fs-xs)", fontWeight: 700,
          }}>{index < LAYERS.length - 1 ? "How it connects" : "Follow the cycle"} →</div>
        </Link>
      ))}
    </div>
  );
}


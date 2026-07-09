import React from "react";

export function StatCard({ label, value, sub, tone = "default" }: {
  label: string; value: string | number; sub?: string;
  tone?: "default" | "accent" | "steel" | "gold";
}) {
  const color = tone === "accent" ? "var(--accent)"
              : tone === "steel" ? "var(--accent-2)"
              : tone === "gold" ? "var(--follow)"
              : "var(--text-primary)";
  return (
    <div style={{
      background: "var(--surface-tint)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: "10px 12px", minWidth: 100,
    }}>
      <div style={{
        fontSize: "var(--fs-2xs)", color: "var(--text-faint)",
        textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 4,
      }}>{label}</div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: "var(--fs-stat)", fontWeight: 700,
        color, fontVariantNumeric: "tabular-nums", lineHeight: 1.1,
      }}>{value}</div>
      {sub && <div style={{
        fontSize: "var(--fs-xs)", color: "var(--text-muted)", marginTop: 2,
      }}>{sub}</div>}
    </div>
  );
}

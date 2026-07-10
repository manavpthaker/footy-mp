import React from "react";

export function AppHeader({ right = null }: { right?: React.ReactNode }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  }).toUpperCase();
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 20,
      display: "flex", alignItems: "center", gap: 9,
      padding: "10px 16px 9px", background: "var(--grad-header)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: "var(--radius-sm)", background: "var(--grad-gold)",
        display: "grid", placeItems: "center", color: "var(--text-on-gold)",
        fontWeight: 700, fontSize: 13, flex: "0 0 auto",
      }}>◆</div>
      <div style={{
        fontWeight: 700, fontSize: "var(--fs-h2)",
        letterSpacing: "0.06em", textTransform: "uppercase",
      }}>MPFC</div>
      <div style={{ flex: 1 }} />
      {right || (
        <div style={{
          fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums",
          fontSize: "var(--fs-2xs)", textTransform: "uppercase",
          letterSpacing: "var(--tracking-label)", color: "var(--text-faint)",
          fontWeight: "var(--fw-semibold)",
        }}>{today}</div>
      )}
    </header>
  );
}

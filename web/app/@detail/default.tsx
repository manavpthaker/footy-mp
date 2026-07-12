import React from "react";

/**
 * The right-pane placeholder shown on desktop when no detail route is active.
 * Also renders on mobile whenever the URL is a plain tab route — but on mobile
 * the detail slot is hidden entirely so this never shows there.
 */
export default function DetailPlaceholder() {
  return (
    <div className="fmp-desktop-only" style={{
      height: "100%", display: "grid", placeItems: "center", padding: "40px 32px",
    }}>
      <div style={{ textAlign: "center", maxWidth: 340 }}>
        <div style={{
          width: 38, height: 38, borderRadius: "var(--radius-sm)",
          background: "var(--surface-raised)", border: "1px solid var(--border)",
          display: "grid", placeItems: "center", margin: "0 auto 12px",
          color: "var(--text-faint)", fontSize: 16,
        }}>◆</div>
        <div style={{
          fontWeight: 700, fontSize: "var(--fs-h2)",
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>Pick a team or a fixture</div>
        <div style={{
          marginTop: 6, fontSize: "var(--fs-sm)",
          color: "var(--text-faint)", lineHeight: "var(--lh-snug)",
        }}>Matches, teams, players and tables you open land here.</div>
      </div>
    </div>
  );
}

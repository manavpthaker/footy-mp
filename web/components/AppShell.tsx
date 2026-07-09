import Link from "next/link";
import React from "react";

/**
 * Header + main content container. Terminal look:
 * warm charcoal, ember accent, wide-tracked display type.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{
        display: "flex", alignItems: "center", gap: 18,
        padding: "10px 20px", background: "var(--grad-header)",
        borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 10,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, background: "var(--grad-gold)",
            display: "grid", placeItems: "center", fontSize: 18,
            boxShadow: "var(--shadow-gold)", color: "var(--text-on-gold)", fontWeight: 700,
          }}>◆</div>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display)", fontSize: 15, margin: 0,
              letterSpacing: "0.3px", fontWeight: 800, textTransform: "uppercase",
            }}>footy-mp</h1>
            <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", marginTop: 1 }}>
              tracker · predictions · everything you follow
            </div>
          </div>
        </Link>
        <div style={{ flex: 1 }} />
        <span style={{
          fontSize: "var(--fs-2xs)", color: "var(--text-faint)",
          textTransform: "uppercase", letterSpacing: "0.1em",
        }}>quant desk</span>
      </header>
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px", width: "100%" }}>
        {children}
      </main>
    </div>
  );
}

export function SectionHeading({ eyebrow, children, right }: {
  eyebrow?: string; children: React.ReactNode; right?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
      <div>
        {eyebrow && <div style={{
          fontSize: "var(--fs-2xs)", color: "var(--text-faint)",
          textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600,
        }}>{eyebrow}</div>}
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: "var(--fs-h2)", margin: 0,
          letterSpacing: "0.02em", fontWeight: 700, textTransform: "uppercase",
        }}>{children}</h2>
      </div>
      <div style={{ flex: 1 }} />
      {right}
    </div>
  );
}

export function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "var(--surface-panel)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-xl)", padding: 16, ...style,
    }}>{children}</div>
  );
}

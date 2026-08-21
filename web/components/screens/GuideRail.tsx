import React from "react";
import Link from "next/link";
import { Pad, eyebrow } from "@/components/mobile/primitives";
import { AskAbout } from "@/components/search/AskAbout";

const sections = [
  ["01", "Players", "/map#players", "var(--follow)"],
  ["02", "Clubs", "/map#clubs", "var(--accent-2)"],
  ["03", "Competitions", "/map#competitions", "var(--accent)"],
  ["04", "National teams", "/map#national-teams", "var(--gold)"],
  ["→", "Road to 2030", "/map#road-to-2030", "var(--gold)"],
] as const;

export default function GuideRail() {
  return (
    <Pad style={{ paddingTop: 18 }}>
      <div style={{ ...eyebrow, color: "var(--accent)" }}>Guide · 0 to 100</div>
      <h2 style={{ margin: "6px 0 8px", fontSize: 22, lineHeight: 1.2, letterSpacing: 0 }}>
        Build the mental map once.
      </h2>
      <p style={{ margin: "0 0 16px", color: "var(--text-muted)", fontSize: "var(--fs-sm)", lineHeight: 1.6 }}>
        Then use matches, tables and transfers as live examples of how the system moves.
      </p>
      <nav aria-label="Guide sections" style={{ display: "grid", gap: 6 }}>
        {sections.map(([step, label, href, color]) => (
          <Link key={label} href={href} style={{
            display: "flex", alignItems: "center", gap: 10, minHeight: 44,
            padding: "9px 10px", background: "var(--surface-panel)",
            border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
          }}>
            <span style={{ width: 24, color, fontFamily: "var(--font-mono)", fontSize: "var(--fs-xs)", fontWeight: 700 }}>
              {step}
            </span>
            <span style={{ flex: 1, fontWeight: 700, fontSize: "var(--fs-sm)" }}>{label}</span>
            <span style={{ color: "var(--text-faint)" }}>›</span>
          </Link>
        ))}
      </nav>
      <div style={{ borderTop: "1px solid var(--border)", marginTop: 18, paddingTop: 16 }}>
        <AskAbout question="I am new to soccer. Explain the four layers and recommend where I should start." label="Ask a beginner question" />
      </div>
    </Pad>
  );
}


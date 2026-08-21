import React from "react";
import Link from "next/link";
import { FootballLayers } from "@/components/guide/FootballLayers";
import { AskAbout } from "@/components/search/AskAbout";

/**
 * The right-pane placeholder shown on desktop when no detail route is active.
 * Also renders on mobile whenever the URL is a plain tab route — but on mobile
 * the detail slot is hidden entirely so this never shows there.
 */
export default function DetailPlaceholder() {
  return (
    <div className="fmp-desktop-only" style={{
      minHeight: "100%", padding: "34px 32px 48px",
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "var(--fs-xs)",
          color: "var(--accent)", fontWeight: 700, textTransform: "uppercase",
        }}>Start here · the whole game in one view</div>
        <div style={{
          marginTop: 8, fontWeight: 700, fontSize: 26, lineHeight: 1.12,
        }}>One sport, four connected systems.</div>
        <div style={{
          marginTop: 9, marginBottom: 20, maxWidth: 610, fontSize: "var(--fs-body)",
          color: "var(--text-muted)", lineHeight: 1.65,
        }}>Players work for clubs, clubs compete in leagues and cups, and countries
          call those players away during international windows. Start with today&apos;s
          stories, then follow any layer as deep as you want.</div>
        <FootballLayers compact />
        <div style={{
          display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8,
          marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)",
        }}>
          <Link href="/map" style={{
            padding: "8px 11px", borderRadius: "var(--radius-md)",
            background: "var(--accent)", color: "var(--text-on-pitch)",
            fontSize: "var(--fs-xs)", fontWeight: 700,
          }}>Open the complete guide →</Link>
          <Link href="/tables" style={{
            padding: "8px 11px", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", fontSize: "var(--fs-xs)",
            color: "var(--accent-2)", fontWeight: 700,
          }}>Explore competitions</Link>
          <AskAbout question="Give me a beginner's orientation to world football and tell me what matters today." />
        </div>
      </div>
    </div>
  );
}

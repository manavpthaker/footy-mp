"use client";
import React from "react";
import { useRouter } from "next/navigation";

/**
 * Sticky header for pushed detail screens. Back chevron goes to router.back(),
 * eyebrow + title layout matches the mobile handoff.
 */
export function ScreenHeader({
  title, eyebrow, right = null,
}: {
  title: React.ReactNode; eyebrow?: React.ReactNode; right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 20,
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px 8px 6px", background: "var(--grad-header)",
      borderBottom: "1px solid var(--border)", minHeight: 46,
    }}>
      <button onClick={() => router.back()} aria-label="Back" style={{
        background: "transparent", border: "none", color: "var(--accent-2)",
        fontSize: 22, lineHeight: 1, padding: "8px 10px", cursor: "pointer",
        fontFamily: "var(--font-mono)",
      }}>‹</button>
      <div style={{ minWidth: 0, flex: 1 }}>
        {eyebrow && <div style={{
          fontSize: "var(--fs-2xs)", textTransform: "uppercase",
          letterSpacing: "var(--tracking-label)", color: "var(--text-faint)",
          fontWeight: "var(--fw-semibold)",
        }}>{eyebrow}</div>}
        <div style={{
          fontWeight: 700, fontSize: "var(--fs-h2)", textTransform: "uppercase",
          letterSpacing: "0.04em", whiteSpace: "nowrap",
          overflow: "hidden", textOverflow: "ellipsis",
        }}>{title}</div>
      </div>
      {right}
    </header>
  );
}

"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TABS } from "./tabs";

/**
 * Bottom tab bar. Sticky, always visible, 48px hit targets, 18px safe-area pad.
 * The active tab is derived from the top-level pathname segment.
 */
export function TabBar() {
  const pathname = usePathname() || "/";
  const seg = pathname === "/" ? "today" : pathname.split("/")[1];
  const activeId = TABS.some(t => t.id === seg) ? seg : "today";
  return (
    <nav className="fmp-mobile-only" style={{
      position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30,
      background: "rgba(19,17,16,0.96)", backdropFilter: "blur(6px)",
      borderTop: "1px solid var(--border)",
      paddingBottom: "max(10px, env(safe-area-inset-bottom))",
    }}>
      <div className="fmp-cap" style={{
        display: "grid", gridTemplateColumns: `repeat(${TABS.length}, 1fr)`,
      }}>
      {TABS.map(t => {
        const on = t.id === activeId;
        return (
          <Link key={t.id} href={t.href} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            padding: "9px 0 6px", minHeight: 48,
            color: on ? "var(--accent)" : "var(--text-faint)",
            fontFamily: "var(--font-ui)", textDecoration: "none",
          }}>
            <span style={{ fontSize: 17, lineHeight: 1, filter: on ? "none" : "grayscale(1)" }}>{t.glyph}</span>
            <span style={{
              fontSize: "var(--fs-micro)", textTransform: "uppercase",
              letterSpacing: "var(--tracking-label)", fontWeight: on ? 700 : 600,
            }}>{t.label}</span>
            <span style={{
              width: 22, height: 2, borderRadius: 1, marginTop: 1,
              background: on ? "var(--accent)" : "transparent",
            }} />
          </Link>
        );
      })}
      </div>
    </nav>
  );
}

"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { id: "today",     glyph: "◆", label: "Today",     href: "/" },
  { id: "matches",   glyph: "⏱", label: "Matches",   href: "/matches" },
  { id: "tables",    glyph: "≣", label: "Tables",    href: "/tables" },
  { id: "following", glyph: "★", label: "Following", href: "/following" },
];

/**
 * Bottom tab bar. Sticky, always visible, 48px hit targets, 18px safe-area pad.
 * The active tab is derived from the top-level pathname segment.
 */
export function TabBar() {
  const pathname = usePathname() || "/";
  const seg = pathname === "/" ? "today" : pathname.split("/")[1];
  const activeId = TABS.some(t => t.id === seg) ? seg : "today";
  return (
    <nav style={{
      position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30,
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      background: "rgba(19,17,16,0.96)", backdropFilter: "blur(6px)",
      borderTop: "1px solid var(--border)", paddingBottom: 18,
      maxWidth: 480, margin: "0 auto",
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
    </nav>
  );
}

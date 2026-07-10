"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { id: "today",     label: "Today",     href: "/" },
  { id: "matches",   label: "Matches",   href: "/matches" },
  { id: "tables",    label: "Tables",    href: "/tables" },
  { id: "following", label: "Following", href: "/following" },
];

/**
 * Desktop top nav — logo + horizontal nav + today date. Hidden below 900px
 * via `.fmp-desktop-only` (see globals.css); the mobile TabBar handles nav
 * at that breakpoint.
 */
export function TopNav() {
  const pathname = usePathname() || "/";
  const seg = pathname === "/" ? "today" : pathname.split("/")[1];
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  }).toUpperCase();

  return (
    <header className="fmp-desktop-only" style={{
      position: "sticky", top: 0, zIndex: 20,
      display: "flex", alignItems: "center", gap: 24,
      padding: "12px 0",
      background: "var(--grad-header)",
      borderBottom: "1px solid var(--border)",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <div style={{
          width: 30, height: 30, borderRadius: "var(--radius-sm)", background: "var(--grad-gold)",
          display: "grid", placeItems: "center", color: "var(--text-on-gold)",
          fontWeight: 700, fontSize: 14, flex: "0 0 auto",
        }}>◆</div>
        <div style={{
          fontWeight: 700, fontSize: "var(--fs-h2)",
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>MPFC</div>
      </Link>
      <nav style={{ display: "flex", gap: 4 }}>
        {NAV.map(n => {
          const on = n.id === seg;
          return (
            <Link key={n.id} href={n.href} style={{
              padding: "7px 14px", borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-ui)", fontSize: "var(--fs-sm)",
              fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
              color: on ? "var(--accent)" : "var(--text-muted)",
              background: on ? "var(--ember-tint)" : "transparent",
              border: `1px solid ${on ? "var(--ember-600)" : "transparent"}`,
              transition: "color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)",
            }}>{n.label}</Link>
          );
        })}
      </nav>
      <div style={{ flex: 1 }} />
      <div style={{
        fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums",
        fontSize: "var(--fs-xs)", textTransform: "uppercase",
        letterSpacing: "var(--tracking-label)", color: "var(--text-faint)",
        fontWeight: "var(--fw-semibold)",
      }}>{today}</div>
    </header>
  );
}

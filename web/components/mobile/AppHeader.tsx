"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RefreshButton } from "./RefreshButton";
import { SearchChat } from "@/components/search/SearchChat";
import { TABS } from "./tabs";

/**
 * One header for both viewports.
 * On mobile it's just the logo + date (nav lives in the bottom TabBar).
 * On desktop it grows an inline tab strip after the logo — this is the
 * only nav; there is no separate TopNav.
 */
export function AppHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const pathname = usePathname() || "/";
  const seg = pathname === "/" ? "today" : pathname.split("/")[1];
  const activeId = TABS.some(t => t.id === seg) ? seg : detailToTab(pathname);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  }).toUpperCase();

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 20,
      background: "var(--grad-header)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 9,
        maxWidth: 1280, margin: "0 auto",
        padding: "0 20px",
        minHeight: "var(--header-h)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 26, height: 26, borderRadius: "var(--radius-sm)", background: "var(--grad-gold)",
            display: "grid", placeItems: "center", color: "var(--text-on-gold)",
            fontWeight: 700, fontSize: 13, flex: "0 0 auto",
          }}>◆</div>
          <div style={{
            fontWeight: 700, fontSize: "var(--fs-h2)",
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>MPFC</div>
        </Link>
        {/* display lives in .fmp-header-nav (none on mobile, flex ≥900px) —
            an inline `display` here would defeat the media query */}
        <nav className="fmp-header-nav" style={{
          alignSelf: "stretch", marginLeft: 14,
        }}>
          {TABS.map(t => {
            const on = t.id === activeId;
            return (
              <Link key={t.id} href={t.href}
                className="fmp-htab" data-on={on ? "true" : "false"}
                style={{
                  position: "relative", display: "flex", alignItems: "center", gap: 6,
                  padding: "0 13px",
                  fontFamily: "var(--font-ui)", fontSize: "var(--fs-xs)", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "var(--tracking-label)",
                }}>
                <span style={{ fontSize: 13, lineHeight: 1, filter: on ? "none" : "grayscale(1)" }}>
                  {t.glyph}
                </span>
                {t.label}
                <span style={{
                  position: "absolute", left: 10, right: 10, bottom: -1, height: 2,
                  background: on ? "var(--accent)" : "transparent",
                }} />
              </Link>
            );
          })}
        </nav>
        <div style={{ flex: 1 }} />
        <button onClick={() => setSearchOpen(true)} aria-label="Search & ask" style={{
          background: "transparent", border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)", color: "var(--text-muted)",
          fontSize: 14, lineHeight: 1, padding: "7px 10px", cursor: "pointer",
          marginRight: 8,
        }}>⌕</button>
        <RefreshButton />
        <div className="fmp-desktop-only" style={{
          fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums",
          fontSize: "var(--fs-2xs)", textTransform: "uppercase",
          letterSpacing: "var(--tracking-label)", color: "var(--text-faint)",
          fontWeight: "var(--fw-semibold)",
        }}>{today}</div>
      </div>
      {searchOpen && <SearchChat onClose={() => setSearchOpen(false)} />}
    </header>
  );
}

/**
 * Map detail routes back to the tab they belong under, so the header
 * still highlights the right tab when the URL is a leaf.
 */
function detailToTab(pathname: string): string {
  if (pathname.startsWith("/matches")) return "matches";
  if (pathname.startsWith("/news")) return "news";
  if (pathname.startsWith("/leagues") || pathname.startsWith("/tables")) return "tables";
  if (pathname.startsWith("/map")) return "map";
  if (pathname.startsWith("/teams") || pathname.startsWith("/players")) return "today";
  if (pathname.startsWith("/following")) return "following";
  return "today";
}

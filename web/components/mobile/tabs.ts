/** Single source of truth for primary nav — consumed by AppHeader (desktop
 *  strip) and TabBar (mobile bottom bar). */
export const TABS = [
  { id: "today",     glyph: "◆", label: "Today",     href: "/" },
  { id: "matches",   glyph: "⏱", label: "Matches",   href: "/matches" },
  { id: "tables",    glyph: "≣", label: "Tables",    href: "/tables" },
  { id: "news",      glyph: "▤", label: "News",      href: "/news" },
  { id: "map",       glyph: "◎", label: "Map",       href: "/map" },
  { id: "following", glyph: "★", label: "Following", href: "/following" },
] as const;

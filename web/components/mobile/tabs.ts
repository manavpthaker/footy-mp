/** Single source of truth for primary nav — consumed by AppHeader (desktop
 *  strip) and TabBar (mobile bottom bar). */
export const TABS = [
  { id: "today",     glyph: "◆", label: "Connect",   href: "/" },
  { id: "matches",   glyph: "⏱", label: "Matches",   href: "/matches" },
  { id: "tables",    glyph: "≣", label: "Standings", href: "/tables" },
  { id: "map",       glyph: "◎", label: "Guide",     href: "/map" },
  { id: "following", glyph: "★", label: "Following", href: "/following" },
] as const;

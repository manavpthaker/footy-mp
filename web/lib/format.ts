/**
 * Display helpers for teams / leagues / countries — flag emoji from FIFA
 * codes, 3-letter short codes, etc. Kept tiny; data lives in Supabase.
 */

const FLAG_BY_FIFA: Record<string, string> = {
  ARG: "🇦🇷", AUS: "🇦🇺", AUT: "🇦🇹", BEL: "🇧🇪", BIH: "🇧🇦", BRA: "🇧🇷",
  CAN: "🇨🇦", CPV: "🇨🇻", COL: "🇨🇴", COD: "🇨🇩", CRO: "🇭🇷", CUW: "🇨🇼",
  CZE: "🇨🇿", DEN: "🇩🇰", ECU: "🇪🇨", EGY: "🇪🇬", ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", FRA: "🇫🇷",
  GER: "🇩🇪", GHA: "🇬🇭", HAI: "🇭🇹", IRN: "🇮🇷", IRQ: "🇮🇶", CIV: "🇨🇮",
  JPN: "🇯🇵", JOR: "🇯🇴", MEX: "🇲🇽", MAR: "🇲🇦", NED: "🇳🇱", NZL: "🇳🇿",
  NOR: "🇳🇴", PAN: "🇵🇦", PAR: "🇵🇾", POR: "🇵🇹", QAT: "🇶🇦", KSA: "🇸🇦",
  SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", SEN: "🇸🇳", RSA: "🇿🇦", KOR: "🇰🇷", ESP: "🇪🇸", SWE: "🇸🇪",
  SUI: "🇨🇭", TUN: "🇹🇳", TUR: "🇹🇷", USA: "🇺🇸", URU: "🇺🇾", UZB: "🇺🇿",
  ITA: "🇮🇹", ALG: "🇩🇿",
};

// Fallback for a small set of common team names (used when we don't have a FIFA
// code — e.g. clubs). Kept short; extend on demand.
const FLAG_BY_TEAM_NAME: Record<string, string> = {
  "Colombia": "🇨🇴", "Switzerland": "🇨🇭", "France": "🇫🇷", "Spain": "🇪🇸",
  "Argentina": "🇦🇷", "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Portugal": "🇵🇹", "Ghana": "🇬🇭",
  "Congo DR": "🇨🇩", "Uzbekistan": "🇺🇿", "Germany": "🇩🇪", "Netherlands": "🇳🇱",
  "Brazil": "🇧🇷", "Belgium": "🇧🇪", "Morocco": "🇲🇦", "Croatia": "🇭🇷",
  "Mexico": "🇲🇽", "Canada": "🇨🇦", "United States": "🇺🇸",
};

export function flagFor(name?: string | null, fifa?: string | null): string {
  if (fifa && FLAG_BY_FIFA[fifa]) return FLAG_BY_FIFA[fifa];
  if (name && FLAG_BY_TEAM_NAME[name]) return FLAG_BY_TEAM_NAME[name];
  return "⚽";
}

/** Minimal team shape needed to resolve a crest image. */
export interface CrestTeam {
  name?: string | null;
  crest_url?: string | null;
  espn_id?: string | null;
  is_national?: boolean | null;
}

/**
 * Crest image URL for a team. Prefers the ingested `crest_url`; falls back to
 * ESPN's stable logo CDN path derived from `espn_id` (covers every team we've
 * ever ingested, since espn_id is our natural key). Returns null when we have
 * neither — callers then fall back to `flagFor()` emoji.
 */
export function crestUrlFor(team?: CrestTeam | null): string | null {
  if (!team) return null;
  if (team.crest_url) return team.crest_url;
  if (team.espn_id) {
    return `https://a.espncdn.com/i/teamlogos/soccer/500/${team.espn_id}.png`;
  }
  return null;
}

const SHORT_BY_TEAM: Record<string, string> = {
  "Colombia": "COL", "Switzerland": "SUI", "France": "FRA", "Spain": "ESP",
  "Argentina": "ARG", "England": "ENG", "Portugal": "POR", "Ghana": "GHA",
  "Congo DR": "COD", "Uzbekistan": "UZB", "Germany": "GER", "Netherlands": "NED",
  "Brazil": "BRA", "Belgium": "BEL", "Morocco": "MAR", "Croatia": "CRO",
  "Bayern Munich": "FCB", "Real Madrid": "RMA", "Barcelona": "BAR",
  "Manchester City": "MCI", "Liverpool": "LIV", "Arsenal": "ARS",
  "Internazionale": "INT", "Juventus": "JUV", "Milan": "MIL", "Napoli": "NAP",
  "Paris Saint-Germain": "PSG", "Bologna": "BOL", "Benfica": "SLB",
  "Atlético Nacional": "NAC", "Club León": "LEO",
};

export function shortNameFor(name: string, fifa?: string | null): string {
  if (SHORT_BY_TEAM[name]) return SHORT_BY_TEAM[name];
  if (fifa) return fifa;
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0] + (parts[2]?.[0] ?? "")).toUpperCase();
  return name.slice(0, 3).toUpperCase();
}

/** Bracket placeholders ("Semifinal 1 Winner") aren't real teams — model
 *  numbers against them are noise and should not be rendered. */
export function isPlaceholderTeam(name?: string | null): boolean {
  if (!name) return true;
  return /(winner|loser|tbd)/i.test(name);
}

export function competitionTone(name: string): "gold" | "sky" | "pitch" | "neutral" {
  if (name === "World Cup" || name === "Champions League" || name === "Euros"
      || name === "Copa America" || name === "Africa Cup of Nations"
      || name === "Gold Cup" || name === "Copa Libertadores") return "gold";
  if (name.startsWith("WC Qualifying") || name === "UEFA Nations League") return "gold";
  if (name === "Premier League" || name === "La Liga" || name === "Serie A"
      || name === "Bundesliga" || name === "Ligue 1" || name === "Europa League"
      || name === "Primeira Liga" || name === "Eredivisie" || name === "Championship") return "sky";
  if (name === "Liga MX" || name === "Categoría Primera A" || name === "MLS") return "pitch";
  return "neutral";
}

export function competitionCode(name: string): string {
  if (name.startsWith("WC Qualifying")) return "WCQ";
  switch (name) {
    case "World Cup": return "WC";
    case "Champions League": return "CL";
    case "Europa League": return "EL";
    case "Copa Libertadores": return "LIB";
    case "Premier League": return "PL";
    case "La Liga": return "LL";
    case "Serie A": return "SA";
    case "Bundesliga": return "BL";
    case "Ligue 1": return "L1";
    case "Championship": return "CH";
    case "Eredivisie": return "ED";
    case "Liga MX": return "MX";
    case "MLS": return "MLS";
    case "Primeira Liga": return "LP";
    case "Categoría Primera A": return "CO";
    case "Africa Cup of Nations": return "AFC";
    case "Gold Cup": return "GC";
    case "UEFA Nations League": return "UNL";
    case "Int. Friendlies": return "FR";
    default: return name.slice(0, 2).toUpperCase();
  }
}

/** 'group-stage' -> 'Group stage', 'semifinals' -> 'Semifinals'. League-season
 *  slugs ('2025-26-english-premier-league', 'regular-season') return null —
 *  a phase chip on a league game is noise. */
export function phaseLabel(phase?: string | null): string | null {
  if (!phase) return null;
  if (/^\d{4}/.test(phase) || /regular-season|torneo/.test(phase)) return null;
  const words = phase.replace(/-/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** How competitions relate — used to group "what's next" on Today + The Map. */
export function formatLabel(format?: string | null): string {
  switch (format) {
    case "league": return "Domestic leagues";
    case "cup": return "Continental cups";
    case "tournament": return "Tournaments";
    case "qualifiers": return "Road to the World Cup";
    case "friendly": return "Friendlies";
    default: return "Other";
  }
}

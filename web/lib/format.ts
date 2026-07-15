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
  if (name === "World Cup" || name === "Champions League" || name === "Euros" || name === "Copa America") return "gold";
  if (name === "Premier League" || name === "La Liga" || name === "Serie A"
      || name === "Bundesliga" || name === "Ligue 1" || name === "Europa League"
      || name === "Primeira Liga") return "sky";
  if (name === "Liga MX" || name === "Categoría Primera A") return "pitch";
  return "neutral";
}

export function competitionCode(name: string): string {
  switch (name) {
    case "World Cup": return "WC";
    case "Champions League": return "CL";
    case "Europa League": return "EL";
    case "Premier League": return "PL";
    case "La Liga": return "LL";
    case "Serie A": return "SA";
    case "Bundesliga": return "BL";
    case "Ligue 1": return "L1";
    case "Liga MX": return "MX";
    case "Primeira Liga": return "LP";
    case "Categoría Primera A": return "CO";
    default: return name.slice(0, 2).toUpperCase();
  }
}

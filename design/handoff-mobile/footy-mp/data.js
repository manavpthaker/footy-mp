/* footy-mp — mock data layer (window.FMP)
   Grounded in the real app's schema: teams, players, leagues, matches,
   predictions, model_ratings, follows. Date pinned: Wed Jul 9, 2026 —
   mid-World Cup, club off-season, Liga MX Apertura about to start. */

(function () {
  const COMPS = {
    wc:  { code: "WC", name: "World Cup 2026", tone: "gold" },
    sa:  { code: "SA", name: "Serie A", tone: "sky" },
    bl:  { code: "BL", name: "Bundesliga", tone: "sky" },
    ucl: { code: "CL", name: "Champions League", tone: "gold" },
    pl:  { code: "PL", name: "Premier League", tone: "sky" },
    ll:  { code: "LL", name: "La Liga", tone: "sky" },
    l1:  { code: "L1", name: "Ligue 1", tone: "sky" },
    mx:  { code: "MX", name: "Liga MX", tone: "pitch" },
    pt:  { code: "LP", name: "Liga Portugal", tone: "sky" },
  };

  const TEAMS = {
    // ---- national ----
    col: { name: "Colombia", short: "COL", flag: "🇨🇴", national: true, country: "Colombia",
           rating: { att: 1.62, def: 0.94, ovr: 78 }, form: "WWDWL",
           factors: [ { label: "ATT XG", z: 0.9 }, { label: "DEF XGA", z: 0.7 }, { label: "FORM", z: 0.5 }, { label: "AVAIL", z: -0.2 } ] },
    sui: { name: "Switzerland", short: "SUI", flag: "🇨🇭", national: true, rating: { att: 1.38, def: 0.82, ovr: 74 }, form: "WDWWD",
           factors: [ { label: "ATT XG", z: 0.4 }, { label: "DEF XGA", z: 1.1 }, { label: "FORM", z: 0.6 }, { label: "AVAIL", z: 0.1 } ] },
    fra: { name: "France", short: "FRA", flag: "🇫🇷", national: true, rating: { att: 2.05, def: 0.78, ovr: 88 }, form: "WWWDW",
           factors: [ { label: "ATT XG", z: 1.6 }, { label: "DEF XGA", z: 1.0 }, { label: "FORM", z: 0.8 }, { label: "AVAIL", z: 0.3 } ] },
    esp: { name: "Spain", short: "ESP", flag: "🇪🇸", national: true, rating: { att: 1.98, def: 0.74, ovr: 87 }, form: "WWDWW",
           factors: [ { label: "ATT XG", z: 1.5 }, { label: "DEF XGA", z: 1.2 }, { label: "FORM", z: 0.7 }, { label: "AVAIL", z: 0.0 } ] },
    arg: { name: "Argentina", short: "ARG", flag: "🇦🇷", national: true, rating: { att: 1.88, def: 0.70, ovr: 86 }, form: "WDWWW",
           factors: [ { label: "ATT XG", z: 1.3 }, { label: "DEF XGA", z: 1.3 }, { label: "FORM", z: 0.6 }, { label: "AVAIL", z: -0.1 } ] },
    eng: { name: "England", short: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", national: true, rating: { att: 1.76, def: 0.81, ovr: 84 }, form: "WWDWD",
           factors: [ { label: "ATT XG", z: 1.1 }, { label: "DEF XGA", z: 0.9 }, { label: "FORM", z: 0.4 }, { label: "AVAIL", z: 0.2 } ] },
    por: { name: "Portugal", short: "POR", flag: "🇵🇹", national: true, rating: { att: 1.7, def: 0.85, ovr: 82 }, form: "WDLWW" },
    gha: { name: "Ghana", short: "GHA", flag: "🇬🇭", national: true, rating: { att: 1.2, def: 1.2, ovr: 65 }, form: "LWDLW" },
    cod: { name: "Congo DR", short: "COD", flag: "🇨🇩", national: true, rating: { att: 1.05, def: 1.3, ovr: 60 }, form: "DLWLD" },
    uzb: { name: "Uzbekistan", short: "UZB", flag: "🇺🇿", national: true, rating: { att: 1.0, def: 1.25, ovr: 58 }, form: "LDLWD" },
    // ---- clubs ----
    bay: { name: "Bayern Munich", short: "FCB", leagueId: "bl", country: "Germany",
           rating: { att: 2.31, def: 0.86, ovr: 89 }, form: "WWLWW",
           factors: [ { label: "ATT XG", z: 1.8 }, { label: "DEF XGA", z: 0.8 }, { label: "FORM", z: 0.9 }, { label: "AVAIL", z: 0.2 } ] },
    bol: { name: "Bologna", short: "BOL", leagueId: "sa", country: "Italy",
           rating: { att: 1.54, def: 0.92, ovr: 76 }, form: "WDWDW",
           factors: [ { label: "ATT XG", z: 0.6 }, { label: "DEF XGA", z: 1.0 }, { label: "FORM", z: 0.7 }, { label: "AVAIL", z: 0.0 } ] },
    leo: { name: "Club León", short: "LEO", leagueId: "mx", country: "Mexico",
           rating: { att: 1.42, def: 1.08, ovr: 68 }, form: "WLDWD",
           factors: [ { label: "ATT XG", z: 0.5 }, { label: "DEF XGA", z: -0.2 }, { label: "FORM", z: 0.3 }, { label: "AVAIL", z: 0.1 } ] },
    nac: { name: "Atlético Nacional", short: "NAC", country: "Colombia",
           rating: { att: 1.5, def: 1.0, ovr: 70 }, form: "WWDLW",
           factors: [ { label: "ATT XG", z: 0.7 }, { label: "DEF XGA", z: 0.2 }, { label: "FORM", z: 0.5 }, { label: "AVAIL", z: 0.0 } ] },
    ben: { name: "Benfica", short: "SLB", leagueId: "pt", country: "Portugal",
           rating: { att: 1.85, def: 0.9, ovr: 81 }, form: "WWWDL",
           factors: [ { label: "ATT XG", z: 1.2 }, { label: "DEF XGA", z: 0.6 }, { label: "FORM", z: 0.6 }, { label: "AVAIL", z: -0.3 } ] },
    chv: { name: "Guadalajara", short: "CHV", leagueId: "mx", country: "Mexico", rating: { att: 1.3, def: 1.1, ovr: 66 }, form: "DWLWD" },
    lyo: { name: "Lyon", short: "OL", leagueId: "l1", country: "France", rating: { att: 1.5, def: 1.05, ovr: 72 }, form: "WDLWW" },
  };

  const LEAGUES = {
    sa:  { name: "Serie A", country: "Italy", season: "2025–26 · final" },
    bl:  { name: "Bundesliga", country: "Germany", season: "2025–26 · final" },
    pl:  { name: "Premier League", country: "England", season: "2025–26 · final" },
    ll:  { name: "La Liga", country: "Spain", season: "2025–26 · final" },
    l1:  { name: "Ligue 1", country: "France", season: "2025–26 · final" },
    ucl: { name: "Champions League", country: "Europe", season: "2025–26 · final" },
    mx:  { name: "Liga MX", country: "Mexico", season: "Apertura 2026 · starts Jul 12" },
  };

  // status: 'final' | 'live' | 'sched'
  const MATCHES = [
    // ---- LIVE: WC semifinal 1 ----
    { id: 201, comp: "wc", round: "Semi-final", status: "live", minute: 63,
      date: "2026-07-09T15:00", home: "fra", away: "esp", hg: 1, ag: 1,
      pred: { h: 0.38, d: 0.27, a: 0.35, hxg: 1.45, axg: 1.38 } },
    // ---- upcoming ----
    { id: 202, comp: "wc", round: "Semi-final", status: "sched",
      date: "2026-07-10T15:00", home: "arg", away: "eng",
      pred: { h: 0.41, d: 0.28, a: 0.31, hxg: 1.32, axg: 1.10 } },
    { id: 210, comp: "mx", round: "Apertura · J1", status: "sched",
      date: "2026-07-12T20:00", home: "leo", away: "chv",
      pred: { h: 0.46, d: 0.28, a: 0.26, hxg: 1.48, axg: 1.02 } },
    { id: 203, comp: "wc", round: "Third place", status: "sched",
      date: "2026-07-18T14:00", home: null, away: null },
    { id: 204, comp: "wc", round: "Final", status: "sched",
      date: "2026-07-19T15:00", home: null, away: null },
    { id: 211, comp: "bl", round: "Friendly", status: "sched",
      date: "2026-07-21T19:30", home: "bay", away: "lyo",
      pred: { h: 0.62, d: 0.21, a: 0.17, hxg: 2.10, axg: 0.95 } },
    // ---- Colombia's World Cup, most recent first ----
    { id: 105, comp: "wc", round: "Quarter-final", status: "final",
      date: "2026-07-04T15:00", home: "sui", away: "col", hg: 0, ag: 0, pens: [4, 3],
      pred: { h: 0.30, d: 0.31, a: 0.39, hxg: 1.02, axg: 1.24 } },
    { id: 104, comp: "wc", round: "Round of 16", status: "final",
      date: "2026-06-30T17:00", home: "col", away: "gha", hg: 1, ag: 0,
      pred: { h: 0.55, d: 0.25, a: 0.20, hxg: 1.62, axg: 0.84 } },
    { id: 103, comp: "wc", round: "Group K · MD3", status: "final",
      date: "2026-06-24T18:00", home: "col", away: "por", hg: 0, ag: 0,
      pred: { h: 0.33, d: 0.29, a: 0.38, hxg: 1.18, axg: 1.30 } },
    { id: 102, comp: "wc", round: "Group K · MD2", status: "final",
      date: "2026-06-18T15:00", home: "col", away: "cod", hg: 1, ag: 0,
      pred: { h: 0.61, d: 0.24, a: 0.15, hxg: 1.80, axg: 0.66 } },
    { id: 101, comp: "wc", round: "Group K · MD1", status: "final",
      date: "2026-06-12T18:00", home: "uzb", away: "col", hg: 1, ag: 3,
      pred: { h: 0.14, d: 0.22, a: 0.64, hxg: 0.72, axg: 1.94 } },
    // ---- club season tail (May) ----
    { id: 110, comp: "sa", round: "MD38", status: "final",
      date: "2026-05-24T18:00", home: "bol", away: "gen", hg: 2, ag: 0,
      pred: { h: 0.52, d: 0.26, a: 0.22, hxg: 1.55, axg: 0.90 } },
    { id: 111, comp: "bl", round: "MD34", status: "final",
      date: "2026-05-16T15:30", home: "bay", away: "hof", hg: 4, ag: 2,
      pred: { h: 0.71, d: 0.17, a: 0.12, hxg: 2.45, axg: 0.88 } },
    { id: 112, comp: "sa", round: "MD37", status: "final",
      date: "2026-05-17T18:00", home: "juv", away: "bol", hg: 3, ag: 3,
      pred: { h: 0.44, d: 0.28, a: 0.28, hxg: 1.42, axg: 1.21 } },
    { id: 113, comp: "pt", round: "MD34", status: "final",
      date: "2026-05-17T20:00", home: "ben", away: "bra", hg: 2, ag: 1,
      pred: { h: 0.64, d: 0.21, a: 0.15, hxg: 2.02, axg: 0.80 } },
  ];

  // teams referenced only inside matches (thin records)
  Object.assign(TEAMS, {
    gen: { name: "Genoa", short: "GEN", leagueId: "sa" },
    hof: { name: "Hoffenheim", short: "TSG", leagueId: "bl" },
    juv: { name: "Juventus", short: "JUV", leagueId: "sa" },
    bra: { name: "Braga", short: "BRA", leagueId: "pt" },
  });

  const PLAYERS = {
    diaz:  { name: "Luis Díaz", pos: "LW", teamId: "bay", country: "Colombia", flag: "🇨🇴", age: 29, key: true,
             season: { comp: "All comps 25–26", g: 22, a: 9, xg: 19.4, xa: 7.8, mins: 3480 },
             wc: { g: 3, a: 1, xg: 2.9, xa: 1.2, mins: 480 },
             log: [
               { opp: "v Switzerland", comp: "WC QF", min: 120, g: 0, a: 0, xg: 0.8 },
               { opp: "v Ghana", comp: "WC R16", min: 90, g: 1, a: 0, xg: 0.6 },
               { opp: "v Portugal", comp: "WC Group", min: 90, g: 0, a: 0, xg: 0.4 },
               { opp: "v Congo DR", comp: "WC Group", min: 78, g: 1, a: 0, xg: 0.7 },
               { opp: "v Uzbekistan", comp: "WC Group", min: 90, g: 1, a: 1, xg: 0.9 },
             ] },
    james: { name: "James Rodríguez", pos: "AM", teamId: "leo", country: "Colombia", flag: "🇨🇴", age: 34, key: true,
             season: { comp: "Clausura 2026", g: 7, a: 11, xg: 5.9, xa: 9.6, mins: 2210 },
             wc: { g: 1, a: 3, xg: 1.4, xa: 2.8, mins: 462 },
             log: [
               { opp: "v Switzerland", comp: "WC QF", min: 104, g: 0, a: 0, xg: 0.2 },
               { opp: "v Ghana", comp: "WC R16", min: 90, g: 0, a: 1, xg: 0.1 },
               { opp: "v Portugal", comp: "WC Group", min: 88, g: 0, a: 0, xg: 0.3 },
               { opp: "v Congo DR", comp: "WC Group", min: 90, g: 0, a: 1, xg: 0.2 },
               { opp: "v Uzbekistan", comp: "WC Group", min: 90, g: 1, a: 1, xg: 0.6 },
             ] },
    rios:  { name: "Richard Ríos", pos: "CM", teamId: "ben", country: "Colombia", flag: "🇨🇴", age: 26,
             season: { comp: "All comps 25–26", g: 6, a: 5, xg: 4.8, xa: 4.1, mins: 3820 },
             wc: { g: 1, a: 0, xg: 0.8, xa: 0.6, mins: 510 },
             log: [
               { opp: "v Switzerland", comp: "WC QF", min: 120, g: 0, a: 0, xg: 0.3 },
               { opp: "v Ghana", comp: "WC R16", min: 90, g: 0, a: 0, xg: 0.1 },
               { opp: "v Portugal", comp: "WC Group", min: 90, g: 0, a: 0, xg: 0.2 },
               { opp: "v Congo DR", comp: "WC Group", min: 90, g: 1, a: 0, xg: 0.4 },
               { opp: "v Uzbekistan", comp: "WC Group", min: 90, g: 0, a: 0, xg: 0.1 },
             ] },
    quin:  { name: "Juan F. Quintero", pos: "AM", teamId: "nac", country: "Colombia", flag: "🇨🇴", age: 33,
             season: { comp: "Liga BetPlay 2026-I", g: 5, a: 8, xg: 4.2, xa: 7.1, mins: 1980 },
             wc: { g: 0, a: 1, xg: 0.5, xa: 1.1, mins: 214 },
             log: [
               { opp: "v Switzerland", comp: "WC QF", min: 46, g: 0, a: 0, xg: 0.2 },
               { opp: "v Ghana", comp: "WC R16", min: 28, g: 0, a: 0, xg: 0.1 },
               { opp: "v Portugal", comp: "WC Group", min: 62, g: 0, a: 0, xg: 0.1 },
               { opp: "v Congo DR", comp: "WC Group", min: 78, g: 0, a: 1, xg: 0.1 },
               { opp: "v Uzbekistan", comp: "WC Group", min: 0, g: 0, a: 0, xg: 0 },
             ] },
    lucu:  { name: "Jhon Lucumí", pos: "CB", teamId: "bol", country: "Colombia", flag: "🇨🇴", age: 28,
             season: { comp: "Serie A 25–26", g: 2, a: 0, xg: 1.1, xa: 0.3, mins: 3150 },
             wc: { g: 0, a: 0, xg: 0.2, xa: 0, mins: 570 },
             log: [
               { opp: "v Switzerland", comp: "WC QF", min: 120, g: 0, a: 0, xg: 0 },
               { opp: "v Ghana", comp: "WC R16", min: 90, g: 0, a: 0, xg: 0 },
               { opp: "v Portugal", comp: "WC Group", min: 90, g: 0, a: 0, xg: 0.1 },
               { opp: "v Congo DR", comp: "WC Group", min: 90, g: 0, a: 0, xg: 0 },
               { opp: "v Uzbekistan", comp: "WC Group", min: 90, g: 0, a: 0, xg: 0.1 },
             ] },
    // supporting cast (squad lists)
    kane:  { name: "Harry Kane", pos: "ST", teamId: "bay", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", age: 32, key: true,
             season: { comp: "All comps 25–26", g: 38, a: 10, xg: 33.2, xa: 8.0, mins: 3900 }, log: [] },
    musi:  { name: "Jamal Musiala", pos: "AM", teamId: "bay", country: "Germany", flag: "🇩🇪", age: 23,
             season: { comp: "All comps 25–26", g: 14, a: 12, xg: 11.8, xa: 10.2, mins: 3100 }, log: [] },
    orso:  { name: "Riccardo Orsolini", pos: "RW", teamId: "bol", country: "Italy", flag: "🇮🇹", age: 29,
             season: { comp: "Serie A 25–26", g: 12, a: 6, xg: 10.4, xa: 5.5, mins: 2800 }, log: [] },
    freu:  { name: "Remo Freuler", pos: "CM", teamId: "bol", country: "Switzerland", flag: "🇨🇭", age: 34,
             season: { comp: "Serie A 25–26", g: 3, a: 4, xg: 2.2, xa: 3.6, mins: 3300 }, log: [] },
  };

  // squads per team (ids into PLAYERS)
  const SQUADS = {
    col: ["diaz", "james", "rios", "quin", "lucu"],
    bay: ["diaz", "kane", "musi"],
    bol: ["lucu", "orso", "freu"],
    leo: ["james"],
    nac: ["quin"],
    ben: ["rios"],
  };

  // ---- standings ----
  const row = (pos, team, flag, P, W, D, L, GD, Pts, zone, form, followed) =>
    ({ pos, team, flag, P, W, D, L, GD, Pts, zone, form, followed, });
  const STANDINGS = {
    sa: [
      row(1, "Inter", "🔵", 38, 26, 6, 6, 43, 84, "ucl", "WWDWW"),
      row(2, "Napoli", "🔷", 38, 24, 7, 7, 32, 79, "ucl", "WDWWL"),
      row(3, "Juventus", "⚪", 38, 21, 11, 6, 28, 74, "ucl", "DWWDW"),
      row(4, "Bologna", "🔴", 38, 20, 11, 7, 21, 71, "ucl", "WDWDW", true),
      row(5, "Milan", "🖤", 38, 19, 11, 8, 19, 68, "uel", "WLDWW"),
      row(6, "Atalanta", "💙", 38, 19, 9, 10, 17, 66, "uel", "LWWDL"),
      row(7, "Roma", "🟡", 38, 18, 10, 10, 12, 64, "conf", "DWLWW"),
      row(8, "Lazio", "🦅", 38, 16, 10, 12, 6, 58, null, "WLDLW"),
      row(9, "Fiorentina", "💜", 38, 15, 11, 12, 4, 56, null, "DLWWD"),
      row(10, "Torino", "🐂", 38, 12, 14, 12, -3, 50, null, "DDWLD"),
      row(11, "Udinese", "⬜", 38, 12, 11, 15, -8, 47, null, "LWDLL"),
      row(12, "Genoa", "🔺", 38, 11, 12, 15, -10, 45, null, "LLDWD"),
      row(13, "Como", "🌊", 38, 11, 11, 16, -9, 44, null, "WDLLD"),
      row(14, "Cagliari", "🟥", 38, 10, 12, 16, -13, 42, null, "DLLWL"),
      row(15, "Parma", "🟨", 38, 10, 10, 18, -15, 40, null, "LDLDW"),
      row(16, "Verona", "🟡", 38, 9, 11, 18, -19, 38, null, "LLDLD"),
      row(17, "Lecce", "🟠", 38, 8, 11, 19, -22, 35, null, "DLLLW"),
      row(18, "Empoli", "🔹", 38, 7, 12, 19, -24, 33, "releg", "LLDLL"),
      row(19, "Venezia", "🟢", 38, 6, 11, 21, -28, 29, "releg", "LDLLL"),
      row(20, "Monza", "⬛", 38, 5, 11, 22, -31, 26, "releg", "LLLDL"),
    ],
    bl: [
      row(1, "Bayern Munich", "🔴", 34, 26, 4, 4, 58, 82, "ucl", "WWLWW", true),
      row(2, "Leverkusen", "⚫", 34, 23, 6, 5, 39, 75, "ucl", "WWDWD"),
      row(3, "Dortmund", "🟡", 34, 20, 8, 6, 27, 68, "ucl", "DWWLW"),
      row(4, "Leipzig", "🔺", 34, 20, 5, 9, 22, 65, "ucl", "WLWWD"),
      row(5, "Frankfurt", "🦅", 34, 18, 6, 10, 14, 60, "uel", "WDLWW"),
      row(6, "Stuttgart", "⚪", 34, 17, 6, 11, 10, 57, "conf", "LWDWL"),
      row(7, "Freiburg", "⚫", 34, 15, 8, 11, 4, 53, null, "DWLDW"),
      row(8, "Wolfsburg", "🟢", 34, 13, 9, 12, -2, 48, null, "WLDLW"),
      row(9, "Gladbach", "⚪", 34, 12, 10, 12, -4, 46, null, "DLWDL"),
      row(10, "Mainz", "🔴", 34, 12, 8, 14, -7, 44, null, "LWDLD"),
      row(11, "Augsburg", "🔴", 34, 11, 9, 14, -9, 42, null, "DLLWD"),
      row(12, "Bremen", "🟢", 34, 11, 8, 15, -12, 41, null, "WLLDL"),
      row(13, "Hoffenheim", "🔵", 34, 10, 9, 15, -14, 39, null, "LDWLL"),
      row(14, "Union Berlin", "🔴", 34, 9, 10, 15, -16, 37, null, "DLDLL"),
      row(15, "St. Pauli", "🟤", 34, 9, 8, 17, -18, 35, null, "LLDWL"),
      row(16, "Cologne", "⚪", 34, 8, 9, 17, -20, 33, "conf", "LDLLD"),
      row(17, "Heidenheim", "🔴", 34, 7, 8, 19, -24, 29, "releg", "LLWLL"),
      row(18, "Kiel", "🔵", 34, 5, 7, 22, -30, 22, "releg", "LLLDL"),
    ],
    pl: [
      row(1, "Arsenal", "🔴", 38, 27, 7, 4, 46, 88, "ucl", "WWWDW"),
      row(2, "Man City", "🔵", 38, 26, 6, 6, 41, 84, "ucl", "WDWWW"),
      row(3, "Liverpool", "🔴", 38, 24, 8, 6, 38, 80, "ucl", "DWWLW"),
      row(4, "Chelsea", "🔵", 38, 21, 9, 8, 24, 72, "ucl", "WWDLW"),
      row(5, "Newcastle", "⚫", 38, 19, 9, 10, 15, 66, "uel", "LWWDW"),
      row(6, "Aston Villa", "🟣", 38, 18, 10, 10, 12, 64, "conf", "DWLWD"),
      row(7, "Tottenham", "⚪", 38, 17, 8, 13, 9, 59, null, "WLWDL"),
      row(8, "Brighton", "🔵", 38, 15, 11, 12, 5, 56, null, "DWDLW"),
    ],
    ll: [
      row(1, "Barcelona", "🔵", 38, 28, 6, 4, 55, 90, "ucl", "WWWWD"),
      row(2, "Real Madrid", "⚪", 38, 26, 7, 5, 48, 85, "ucl", "WWDWW"),
      row(3, "Atlético", "🔴", 38, 22, 9, 7, 27, 75, "ucl", "DWWDW"),
      row(4, "Athletic Club", "🦁", 38, 19, 10, 9, 16, 67, "ucl", "WDLWW"),
      row(5, "Villarreal", "🟡", 38, 18, 9, 11, 12, 63, "uel", "WLWDW"),
      row(6, "Betis", "🟢", 38, 16, 11, 11, 6, 59, "conf", "DWDWL"),
      row(7, "Sociedad", "🔵", 38, 15, 10, 13, 3, 55, null, "LDWWD"),
      row(8, "Girona", "🔴", 38, 14, 10, 14, -2, 52, null, "WDLLW"),
    ],
    l1: [
      row(1, "PSG", "🔵", 34, 27, 5, 2, 62, 86, "ucl", "WWWWW"),
      row(2, "Monaco", "🔴", 34, 21, 7, 6, 28, 70, "ucl", "WDWWL"),
      row(3, "Marseille", "⚪", 34, 19, 8, 7, 21, 65, "ucl", "DWWDW"),
      row(4, "Lille", "🔴", 34, 17, 9, 8, 13, 60, "uel", "WLDWW"),
      row(5, "Lyon", "🦁", 34, 16, 9, 9, 10, 57, "uel", "WDLWW"),
      row(6, "Nice", "🔴", 34, 15, 9, 10, 6, 54, "conf", "DLWWD"),
      row(7, "Lens", "🟡", 34, 14, 9, 11, 2, 51, null, "LWDWL"),
      row(8, "Rennes", "🔴", 34, 13, 9, 12, -1, 48, null, "WDLDW"),
    ],
  };

  const FOLLOWS = {
    teams: ["col", "bay", "bol", "leo", "nac", "ben"],
    players: ["quin", "rios", "james", "diaz", "lucu"],
    leagues: ["sa", "ucl", "bl", "l1", "ll", "pl"],
    countries: ["Colombia"],
  };

  // ---- helpers ----
  const NOW = new Date("2026-07-09T16:03:00");

  function fmtDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  }
  function fmtTime(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  function fmtDayLabel(iso) {
    const d = new Date(iso);
    const today = NOW.toDateString() === d.toDateString();
    const tomorrow = new Date(NOW.getTime() + 864e5).toDateString() === d.toDateString();
    if (today) return "TODAY";
    if (tomorrow) return "TOMORROW";
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  }

  // Poisson scoreline matrix from expected goals
  function poissonMatrix(hxg, axg, n = 5) {
    const fact = [1, 1, 2, 6, 24, 120, 720];
    const p = (l, k) => Math.exp(-l) * Math.pow(l, k) / fact[k];
    const m = [];
    for (let h = 0; h < n; h++) {
      const rowArr = [];
      for (let a = 0; a < n; a++) rowArr.push(p(hxg, h) * p(axg, a));
      m.push(rowArr);
    }
    return m;
  }

  const team = (id) => TEAMS[id] || null;

  const NEWS = [
    { time: "2h ago", tag: "WC26", tone: "gold", text: "France–Spain semifinal underway — model had it a coin flip (38/27/35)." },
    { time: "5h ago", tag: "BAYERN", tone: "follow", text: "Luis Díaz named in Bundesliga Team of the Season after 22-goal campaign." },
    { time: "1d ago", tag: "LIGA MX", tone: "neutral", text: "Apertura 2026 kicks off Jul 12 — León open at home to Guadalajara, James expected to start." },
    { time: "2d ago", tag: "MODEL", tone: "accent", text: "v1 ratings re-fit after the QF round: availability weights ramped for tournament play." },
    { time: "4d ago", tag: "COLOMBIA", tone: "follow", text: "Out on penalties — held Switzerland to 0.9 xG over 120′, model priced COL 39% to advance." },
  ];

  const isFollowedTeam = (id) => FOLLOWS.teams.includes(id);
  const followedMatch = (m) => isFollowedTeam(m.home) || isFollowedTeam(m.away);

  window.FMP = {
    COMPS, TEAMS, LEAGUES, MATCHES, PLAYERS, SQUADS, STANDINGS, FOLLOWS, NEWS, NOW,
    team, isFollowedTeam, followedMatch,
    fmtDate, fmtTime, fmtDayLabel, poissonMatrix,
    upcoming: () => MATCHES.filter(m => m.status !== "final").sort((a, b) => new Date(a.date) - new Date(b.date)),
    results: () => MATCHES.filter(m => m.status === "final").sort((a, b) => new Date(b.date) - new Date(a.date)),
    matchesForTeam: (id) => MATCHES.filter(m => m.home === id || m.away === id),
    matchById: (id) => MATCHES.find(m => m.id === id),
  };
})();

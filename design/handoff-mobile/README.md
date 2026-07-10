# Handoff: MPFC Mobile Redesign

## Overview
A mobile-first redesign of the MPFC tracker (github.com/manavpthaker/footy-mp, live at mpfc-ashen.vercel.app). It replaces the single-scroll dashboard with a 4-tab app: **Today** (now & next + news), **Matches** (filterable fixtures/results), **Tables** (zone-railed standings), **Following** (watchlist management), plus drill-in detail screens for Match, Team, Player, and League. The prediction model (xG Dixon-Coles) is surfaced as first-class content everywhere.

## About the Design Files
The files in this bundle are **design references created in HTML/React (Babel, no build step)** — a clickable prototype showing intended look and behavior, **not production code to copy directly**. Recreate these screens in the target codebase: **Next.js 14 App Router** (`web/`) with Supabase data (`web/lib/data.ts`). The prototype's mock data layer (`footy-mp/data.js`) mirrors the real schema (matches, predictions, model_ratings, follows), so mapping is mostly 1:1.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii, and interactions are final and drawn from the bound "Quant Desk" design system (`design/project/` in the repo — tokens in `tokens/*.css`, components exported on `window.WC26VisualizerDesignSystem_b4eaf5`). Recreate pixel-perfectly using those tokens; in production, port the DS components used here (MatchRow, FixtureGroup, ProbabilityBar, LeagueTable, StatCard, RatingRing, FactorBar, FormPills, ScorelineGrid, PlayerCard, PlayerStatRow, FollowButton, SectionHeading, CompetitionBadge, Tag) into `web/components/`.

## Information Architecture
- Root: bottom tab bar (4 tabs), always visible, ~48px hit targets, safe-area padding 18px below.
- Detail screens push onto a stack over the active tab (back chevron in a sticky header). Tapping any tab clears the stack.
- Nav state + follow toggles persist (prototype: localStorage `fmp-nav-v1`, `fmp-follows-v1`; production: URL routes + Supabase `follows`).

## Screens / Views

### 1. Today (root, default tab)
Purpose: answer "who plays next, when, against whom" + what just happened, at a glance.
Order (16px side padding, sections opened by DS SectionHeading — 4×14px tick, uppercase, 0.16em tracking, 12px, `--text-muted`):
1. **Next-match hero** — panel (`--surface-panel`, 1px `--border`, 6px radius) with 3px inset gold rail (`box-shadow: inset 3px 0 0 var(--follow)`). Eyebrow: `YOUR NEXT MATCH · TODAY/TOMORROW/IN N DAYS` (10px, 0.1em tracking, gold) + CompetitionBadge right. 3-col grid: flag 24px + team name (12px, 700, uppercase) | kickoff time (15px mono 700) over date eyebrow | away team. Below: DS ProbabilityBar (h=18) + row `{round}` / `preview →` (steel cyan).
2. **Live hero** (when a match is live) — same panel anatomy, 3px red rail. Eyebrow row: CompetitionBadge (gold tone) + `● LIVE {minute}′` (red, pulsing 6px dot, 1.4s). Score 30px mono 700 red between team columns (flag 26px). ProbabilityBar (h=24) + `pre-match · mpfc v1` / `full read →`.
3. **Next up for you** (gold tick) — remaining followed fixtures as fixture rows (see Fixture Row spec).
4. **News** (ember tick) — single panel, rows separated by 1px `--border-soft`: tag chip (9px, 700, 2px radius; gold tint for follows/WC, ember tint for model, `--surface-raised` neutral) + text (12px, `--lh-snug` 1.3) + relative time (10px mono, `--text-faint`).
5. **World Cup · knockouts** (steel tick, `all →` trailing) — fixture rows.
6. **Just in** (`all →` trailing) — 4 most recent followed results.
7. **Your players at the cup** (gold tick) — DS PlayerStatRow per followed player: flag, name (+gold ★), meta `club · pos`, figures G (ember when >0) / A / MIN. Tap → Player screen.
8. Footer eyebrow, centered: `xG Dixon-Coles on real shot data · not betting advice`.

### 2. Matches
- Segmented control (2 options: UPCOMING / RESULTS): `--surface-tint` container, 2px padding, active segment `--surface-raised` + ember text.
- Horizontally scrolling chip rail: `★ Following` toggle chip, divider, then competition chips (All, World Cup, Serie A, Bundesliga, Liga MX, Liga Portugal). Chip: 7×11px, 4px radius, active = ember tint bg + `--ember-600` border + ember text.
- Fixtures grouped by day via DS FixtureGroup (label TODAY / TOMORROW / `THU JUL 10`).

### 3. Tables
- League chip rail (Serie A, Bundesliga, Premier League, La Liga, Ligue 1).
- Header row: league name (15px 700 uppercase) + season eyebrow + `fixtures →` link (steel).
- DS LeagueTable: 3px inset zone rails (`--zone-ucl` ember / `--zone-uel` steel / `--zone-conf` amber / `--zone-releg` red), followed teams gold ★, form column W/D/L colored letters. Row tap → Team screen.
- Zone legend beneath (8px swatches + eyebrow labels).

### 4. Following
- 3 StatCards: players / teams / leagues counts (gold value when >0).
- Sections (gold ticks): Players, Teams, Leagues — each row: flag/emoji, name (12px 700), meta line (11px `--text-faint`), DS FollowButton (icon-only, gold ★ pill when following). Row tap navigates; star tap only toggles (stopPropagation).

### 5. Match detail (pushed)
- Sticky header: back ‹ (steel, 22px), eyebrow `{competition} · {round}`, title `SUI v COL`.
- Scoreboard panel (6px radius): 3-col — tappable team columns (flag 30px, name 12px 700 uppercase, gold ★ if followed) around score 32px mono 700 (red if live) or `vs`; pens line `4–3 pens` 11px; status eyebrow FULL TIME / `● 63′` / kickoff datetime.
- **Pre-match forecast / What the model expected**: DS ProbabilityBar (h=30, labels = short codes), 2 StatCards (`expected goals` `1.02–1.24`, `model v1 · xG Dixon-Coles`).
- **Verdict callout** (finals only): 3px ember left border, `--surface-tint`, 12px text — "Model favorite landed — priced 39% pre-kick." / "Upset by the model's book…".
- **Scoreline odds**: DS ScorelineGrid, 5×5 Poisson matrix computed from pred xG.
- **Form · last 5**: two panels with DS FormPills (20px).
- **What drives the forecast**: two panels of DS FactorBars (ATT XG / DEF XGA / FORM / AVAIL as signed z-scores), footnote eyebrow.

### 6. Team detail (pushed)
- Header: eyebrow (league or "National team"), `{flag} {name}`, FollowButton (labeled).
- Rating panel: DS RatingRing (62px, ovr /99) + StatCards `attack · xG/90` (ember) and `defense · xGA/90` (steel).
- Form pills row.
- Segmented: MATCHES / SQUAD · n / MODEL. Matches = next up + results fixture rows; Squad = DS PlayerCards (age lead, `pos · country`, key players starred); Model = FactorBar panel.

### 7. Player detail (pushed)
- Header: eyebrow `{pos} · {country}`, `{flag} {name}`, FollowButton.
- Club card (tappable →Team, `›` steel chevron).
- **World Cup 2026**: 4 StatCards (goals — ember when >0, assists, xG, mins).
- **Season**: 4 StatCards (G+A ember, xG, xA, mins).
- **Match log**: PlayerStatRows (opponent, comp, MIN/G/XG figures).

### 8. League detail (pushed)
- Header: eyebrow = season label, name, FollowButton. Fixtures, latest results (comp badge hidden), standings table.

## Fixture Row (core primitive — DS MatchRow composed)
- Left 44px mono column: `FT` | red `LIVE` | date+time stacked; competition code beneath in `--text-faint`.
- Middle: `{flag} Home v Away {flag}` single line, ellipsis; gold ★ after followed team names.
- Right readout: final → score 15px mono 700 (+ `4–3 pens` 9px); live → red score + `● 63′`; scheduled → **tweakable**: 56×5px 3-segment mini prob bar (steel/track/ember) + favorite label `H 46%`, or favorite text only.
- Followed match ⇒ 3px inset gold rail on the row.

## Interactions & Behavior
- Screen transitions: fadeUp 0.28s `cubic-bezier(0.4,0,0.2,1)` (9px rise), gated behind `prefers-reduced-motion: no-preference`.
- Hover/tap: DS defaults (border → steel, translateY(-1px), `--surface-hover`).
- Live dot: 1.4s expanding red ring pulse.
- Scroll resets to top on push/tab change; content bottom padding 92px clears the tab bar.
- Error boundary per screen: broken screen renders a "↺ Back to Today" recovery card, never a blank app.
- Empty states: 1px dashed `--border` card, 12px `--text-faint`, centered.

## State Management
- `nav`: `{ tab, stack: [{type: 'match'|'team'|'player'|'league', id}] }` (production: routes `/matches/[id]` etc. + tab layout).
- `follows`: Set of `type:id` keys → Supabase `follows` table.
- `tweaks` (design options to settle or keep as settings): row prediction readout `bar | fav`, matches ★-only default (true), density `regular | dense`, tab labels (true).
- Matches screen local: mode, competition filter, followed-only.

## Design Tokens
All from `tokens/colors.css`, `typography.css`, `spacing.css` in the repo's `design/project/`:
- Font: **Spline Sans Mono** only; weights 400–700; `tabular-nums` for every figure.
- Key colors: bg `#131110`, panel `#1a1715`, border `#2e2722`/`#262019`, text `#e9e2d8`/`#a99a87`/`#8a7d6d`, ember `#ff9d2e`, steel `#4fc1dd`, gold `#ffce53`, red `#ff5d3a`, amber `#ffb13d`.
- Type scale: 24/18/15/13/12/11/10/9px; eyebrows 10px uppercase 0.1em.
- Radii: 2/3/4/4/5/6px (xs→2xl); rails always 3px inset box-shadow.
- Motion: 0.12/0.15/0.3/0.5s, ease `cubic-bezier(0.4,0,0.2,1)`.

## Assets
None — iconography is emoji/unicode per the design system (◆ brand mark, ⏱ ≣ ★ tabs, country flag emoji, ● live, ★ follow). No raster assets.

## Files
- `Footy MP Mobile.html` — entry (token links, DS bundle, script order).
- `footy-mp/data.js` — mock data + Poisson helper (mirrors Supabase schema).
- `footy-mp/ui.jsx` — chrome: AppHeader, ScreenHeader, TabBar, FixtureItem, readouts, chips, segmented.
- `footy-mp/screens-main.jsx` — Today, Matches, Tables, Following (+ NextMatchCard, LiveHeroCard, NewsList).
- `footy-mp/screens-detail.jsx` — Match, Team, Player, League.
- `footy-mp/app.jsx` — nav stack, follows state, error boundary, tweaks.
- `footy-mp/ios-frame.jsx`, `footy-mp/tweaks-panel.jsx` — presentation shell only; do not port.

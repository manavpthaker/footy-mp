# MPFC "Quant Desk" — Design System

Grown out of **MP's World Cup Visualizer 2026** (`mpthaker.xyz/wc26.html`)
and rebuilt as its own identity for **MPFC**, a multinational,
multi-league football platform: club leagues (Big-5 Europe, MLS, Liga MX),
continental cups (UCL, Libertadores), and international windows (WC26
qualifiers, Nations League), with followable players/teams and the same
composite-rating + Poisson prediction models applied to every match.

**Identity: "Quant Desk."** MPFC is a deliberate departure from the WC26
visualizer's navy "stadium at night" look. The world is a warm charcoal
terminal — Bloomberg for football. One mono voice everywhere, ember-orange as
the signal color, squared corners, dashed hairlines where it fits. The
analytical DNA (status semantics, dense tables, tabular figures) carries over;
the skin does not.

## Sources
- **Product:** `mpthaker.xyz/wc26.html` (single-file app — the design's source of truth)
- **Codebase (read-only, mounted):** `mpthaker-xyz/` — the app lives at
  `mpthaker-xyz/public/wc26.html`; data model in `mpthaker-xyz/lib/wc26/*` and
  `mpthaker-xyz/data/wc26/seed.json`.
- A verbatim copy of the original app is kept at `reference/wc26-original.html`
  with reference screenshots in `reference/` for visual fidelity.

---

## What changed in the Quant Desk rebrand
The WC26 system used three faces (Archivo / Inter / JetBrains Mono) on navy.
MPFC collapses to **one voice — Spline Sans Mono — everywhere**. Hierarchy
comes from weight (400–700), UPPERCASE + tracking, and color, never from
switching families. Every figure is tabular by nature.

Everything else (palette, density, component anatomy, motion) is preserved and
codified into tokens rather than re-invented.

> **Font note:** Spline Sans Mono loads from Google Fonts (`tokens/fonts.css`).
> Self-host by replacing the `@import` with `@font-face` rules.

---

## CONTENT FUNDAMENTALS — how the product talks

The voice is **a sharp analyst at a chalkboard**: confident, numeric, plain-spoken,
faintly witty. It explains *why*, never hypes.

- **Person:** Mostly impersonal/declarative ("Teams fill in from the live
  standings"). Direct second-person *only* for instructions ("**Tap any team to
  advance them**", "hit ⟳ to refresh"). First person appears only in the product
  name ("**MP's** World Cup Visualizer").
- **Tone:** Analytical and honest about uncertainty. The model "leaks real upset
  probability"; factors "ramp in over a team's first few games (small-sample
  guard)". It cites its own method ("**Backtested on Qatar 2022**") and disclaims
  ("A strength model for analysis & entertainment — not betting advice").
- **Casing:** UPPERCASE micro-labels and eyebrows with wide tracking
  (`MODEL RATING — COMPOSITE STRENGTH`, `FIFA WORLD RANK`, `ROUND OF 32`).
  Sentence case for body and instructions. Title case avoided.
- **Numbers are the nouns.** Copy leans on figures: "Title odds = 3,000-run
  Monte-Carlo", "composite strength 69/99", "54% win". Always show the method
  behind the number.
- **Emphasis:** **Bold** carries the key term inside an explanation
  ("the **official FIFA bracket structure**", "each side's **expected goals**").
- **Football register, lightly:** "xG", "form", "knockout", "group finish",
  "third-placed teams", "shootout". Team short codes in dense rails (BRA, MAR, USA).
- **Emoji as iconography, not decoration:** 🏆 (the product mark), ⚡ (model
  action), ⟳ (sync), ⚙ (settings), ⏱ (upcoming), ● (live), ⭐ (key player),
  and country flag emoji as team identity. Never emoji in body sentences.
- **Microcopy examples:** "Pick a team or a fixture" · "PREVIEW →" ·
  "Updated — live as of 11:58 AM" · "Projected Champion" ·
  "⚡ Auto-fill by model" · "what drives the forecast".

---

## VISUAL FOUNDATIONS

**Overall vibe:** a quant trading desk pointed at football. Warm charcoal
surfaces, ember-orange signal, steel-cyan secondary, tape-gold follow layer.
Tightly-packed mono modules; squared, terminal, confident.

**Color** (`tokens/colors.css`)
- **Background** is a warm charcoal ramp (`--coal-950 → --coal-600`) with a
  faint warm radial glow top-right (`--grad-app`). Header: `--grad-header`.
- **Primary accent = ember orange** (`--ember-500 #ff9d2e`) — qualification,
  wins, "away" probability, key players, primary CTAs. (Legacy `--pitch-*`
  aliases resolve here, so older components restyle automatically.)
- **Secondary = steel cyan** (`--steel-500 #4fc1dd`) — runner-up, "home"
  probability, hover/focus borders, links. (Aliased from `--sky-*`.)
- **Tape gold** (`--gold-500 #ffce53`) — champion, the 🏆 mark, the follow ★.
- **Signal:** red (`--red-500`) eliminated/loss/live; amber (`--amber-500`)
  third-place playoff hunt / "as of" warnings; slate (`--slate-500`) draws.
- **Status is a first-class semantic layer:** `--status-through / -runner /
  -playoff / -out / -win / -draw / -loss / -live`. This is the system's meaning.
- **League zones** reuse the same hues at season scale: `--zone-ucl` (green) /
  `--zone-uel` (sky) / `--zone-conf` (amber) / `--zone-releg` (red) drive the
  3px inset rail on `LeagueTable` rows.
- **Following is gold:** `--follow` / `--follow-tint` mark followed players,
  teams, and leagues — the ★ star everywhere.
- Accent fills may use the **135° gradients** (`--grad-pitch/-sky/-gold`), but
  flat ember is equally at home in the terminal idiom.

**Type** (`tokens/typography.css`)
- **Spline Sans Mono** — the only family. Display roles are 700 + UPPERCASE +
  wide tracking; UI is 400/500; figures use `font-variant-numeric: tabular-nums`
  (`.tabular` helper). `--fw-extrabold`/`--fw-black` clamp to 700.
- Dense scale (base 13px). Eyebrows are 10px UPPERCASE, tracked `0.1em`.
  Section headings 12px UPPERCASE, tracked `0.07em`.

**Spacing & layout** (`tokens/spacing.css`)
- 4px-based scale; tight rhythm. Two-pane "rail + detail" layout on desktop
  (`--col-groups-w 460px`), single-column with a slide-in detail overlay on mobile.
- The bottom tab bar becomes thumb-reachable on mobile.

**Corners & cards**
- Radii: tags 5px, pills 18px, buttons/inputs 9px, fixture rows 11px, cards/panels
  13px, hero cards 14px. Cards = `--surface-panel` + 1px `--border` + 13px radius.
- The signature device: a **3px inset accent rail** on standings rows
  (`box-shadow: inset 3px 0 0 <status>`) marking qualification fate.

**Shadows**
- Cards are flat at rest; **shadow on hover lift** (`--shadow-lift`). Toasts and
  popovers use `--shadow-pop`. Pitch/gold fills carry a soft colored glow
  (`--shadow-accent`, `--shadow-gold`). No heavy ambient shadows.

**Borders & dividers**
- `--border` (#243450) for card edges; `--border-soft` (#1b2740) for table row
  hairlines. The "lowdown" callout uses a 3px left accent border.

**Backgrounds & texture**
- No photography, no illustration, no noise. The atmosphere is pure color: the
  charcoal gradient + the warm radial. Tinted panels (`--surface-tint`) for
  callouts. Flags and the trophy are the only "imagery," all emoji.

**Motion** (`tokens/spacing.css` motion tokens)
- Quick and functional: `fadeUp` (9px, 0.3s) for entering modules, `barGrow`
  (scaleX, 0.5s `--ease-out`) for every bar/probability fill, `popIn` for the
  champion box. Hover = `translateY(-1/-2px)` lift. A gentle infinite `bob` on
  the 🏆 only, and a `pulse` ring on the live ● dot. Everything respects
  `prefers-reduced-motion`.

**Hover / press**
- Hover: border lifts to steel-cyan, surface lightens to `--surface-hover`,
  card lifts 1–2px. Active tabs/CTAs fill ember + glow. No press-shrink.

**Transparency & blur**
- Minimal. Chip backgrounds use low-alpha tints (`--ember-tint`, `--red-tint`).
  No glassmorphism/backdrop-blur.

---

## ICONOGRAPHY

The visualizer has **no icon font and no custom logo**. Its iconography is
deliberately lightweight and emoji/unicode-driven — keep it that way.

- **Country flags:** Unicode flag emoji are team identity, everywhere (🇧🇷 🇫🇷 🇲🇽).
  England/Scotland use the subdivision-tag emoji (🏴󠁧󠁢󠁥󠁮󠁧󠁿 / 🏴󠁧󠁢󠁳󠁣󠁴󠁿). Fallback glyph is ⚽.
- **The mark:** 🏆 in a gold gradient rounded square is the product's de-facto logo.
- **Action/affordance glyphs (emoji + unicode):** ⚡ model action · ⟳ sync ·
  ⚙ settings · ⏱ upcoming · ● live · ⭐ key player · ↺ reset · ⇅ reorder ·
  → / ✓ / ✕ inline affordances.
- **The only hand-authored SVGs** in the original are a tiny search magnifier
  (stroke 2, currentColor) and the bracket connector lines (`<svg>` strokes in
  `--border` / `--accent`). Reuse those patterns; don't introduce a heavy icon set.
- **No raster brand assets** were copied — the brand is typographic + emoji. If a
  consuming surface needs lined icons, match a 2px-stroke set (e.g. Lucide via CDN)
  and keep them sparse; **flagged** as an addition, not part of the original.

---

## INDEX — what's in this system

**Foundations**
- `styles.css` — entry point (imports the token + font closure only).
- `tokens/colors.css` — charcoal ramp, accents, status semantics, gradients.
- `tokens/typography.css` — Spline Sans Mono voice, scale, `.tabular`.
- `tokens/spacing.css` — spacing, radius, shadow, motion, layout tokens.
- `tokens/fonts.css` — Google Fonts import (substitution — see flag above).
- Specimen cards: `guidelines/*.card.html` (Colors, Type, Spacing, Brand).

**Components** (`window.WC26VisualizerDesignSystem_b4eaf5.*`)
- core/ — `Button`, `IconButton`, `Tag`, `SectionHeading`, `FollowButton`
- data/ — `StatCard`, `RatingRing`, `FactorBar`, `ProbabilityBar`, `FormPills`, `BarMeter`, `ScorelineGrid`
- football/ — `GroupStandings`, `PlayerCard`, `MatchRow`, `LeagueTable`, `FixtureGroup`, `PlayerStatRow`, `CompetitionBadge`

**UI kit**
- `ui_kits/visualizer/` — interactive recreation of the visualizer (Groups +
  team detail, Match preview, Bracket/predictor). `index.html` is the entry.

**Other**
- `reference/` — verbatim original + screenshots (visual source of truth).
- `SKILL.md` — Agent-Skill manifest for use in Claude Code.

> Namespace for `@dsCard` / kit HTML: `window.WC26VisualizerDesignSystem_b4eaf5`.

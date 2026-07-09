---
name: wc26-visualizer-design
description: Use this skill to generate well-branded interfaces and assets for MP's World Cup Visualizer 2026 (wc26-visualizer), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping a dark, analytical, World-Cup-broadcast aesthetic.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Where things are
- `readme.md` — the full design guide: context, content fundamentals (voice), visual foundations, iconography, and an index of everything.
- `styles.css` — the single entry point; link this to inherit all tokens + fonts.
- `tokens/` — `colors.css` (navy ramp, pitch/sky/gold accents, **status semantics**), `typography.css` (Archivo display / Inter UI / JetBrains Mono data), `spacing.css`, `fonts.css`.
- `components/` — React primitives, grouped `core/`, `data/`, `football/`. Load the compiled bundle and read them from `window.WC26VisualizerDesignSystem_b4eaf5`.
- `ui_kits/visualizer/` — a full interactive recreation of the visualizer (Groups, team detail, match preview, knockout predictor). `index.html` is the entry; `data.js` + `model.js` carry the real data and the composite-rating + Poisson + bracket model.
- `guidelines/*.card.html` — foundation specimen cards.
- `reference/` — verbatim original app + screenshots (visual source of truth).

## The look in one paragraph
A stadium at night rendered as a data terminal: deep navy surfaces with a single floodlight radial glow, a luminous **pitch-green** primary, **sky-blue** secondary, **trophy-gold** for champions, and red/amber signal colors. **Status is a first-class semantic** (through / runner-up / playoff / out). Three type voices — Archivo for scoreboard headings/team names, Inter for UI, and JetBrains Mono (tabular) for *every figure*. Dense, analytical, broadcast-adjacent. Cards are flat with hover-lift; the signature device is a 3px inset accent rail on standings rows. Motion is quick and functional (fade-up, bar-grow). Iconography is emoji + unicode (flags, 🏆, ⚡ ⟳ ⚙ ●) — no icon font, no custom logo.

## Rules of thumb
- Put **every number in JetBrains Mono with tabular figures** so columns lock.
- Use accents as 135° gradients on fills, never flat.
- Reach for the status tokens (`--status-through/-runner/-playoff/-out/-win/-draw/-loss/-live`) — they carry the product's meaning.
- Keep copy analytical and honest about uncertainty; cite the method behind every number. UPPERCASE tracked eyebrows, sentence-case body, terse status tags (Q / OUT).
- Don't invent a heavy icon set or photography; the atmosphere is pure color + emoji.

## Font note
Inter, Archivo, and JetBrains Mono load from Google Fonts (`tokens/fonts.css`) — the original shipped no binaries. Self-host if you have licensed files.

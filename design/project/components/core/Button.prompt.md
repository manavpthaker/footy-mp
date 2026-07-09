**Button** — the system's action control; use for model controls, bracket actions, and any CTA. Pitch-green `primary` for the main action, `gold` for champion/title actions, `secondary` (default) for toolbar buttons, `ghost` for low-emphasis.

```jsx
<Button variant="primary" iconLeft="⚡">Auto-fill by model</Button>
<Button variant="gold">Crown champion</Button>
<Button variant="secondary" iconLeft="↺">Reset</Button>
<Button variant="ghost" size="sm">Match # order</Button>
```

Variants: `primary | gold | secondary | ghost`. Sizes: `sm | md | lg`. Pass `iconLeft` / `iconRight` for glyphs (emoji or SVG). Hover lifts the border to sky-blue on secondary/ghost.

**IconButton** — square 34px control for the header rail (sync, model settings) and other icon-only affordances. Use `active` for the engaged/spinning state.

```jsx
<IconButton title="Sync latest scores">⟳</IconButton>
<IconButton title="Model controls" active>⚙</IconButton>
```

Props: `size` (px, default 34), `active` (pitch-green), `title` (label + tooltip). Hover lifts to sky-blue border.

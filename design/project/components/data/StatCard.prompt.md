**StatCard** — labelled metric tile. Lay several in a `repeat(auto-fit, minmax(110px,1fr))` grid for a team's stat strip.

```jsx
<StatCard label="FIFA World Rank" value="#6" />
<StatCard label="Goals" value="7" unit=":1" />
<StatCard label="Points" value="7" accent="var(--accent)" />
```

The value always renders in the mono/tabular voice so columns of figures align. Use `accent` sparingly to highlight one metric.

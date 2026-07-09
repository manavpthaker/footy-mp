**BarMeter** — thin magnitude bar for odds tables, possession splits, and generic proportions.

```jsx
<BarMeter value={18.4} max={45} />
<BarMeter value={62} fill="var(--accent-2)" />
```

Defaults to the pitch→sky gradient. Set `max` to the largest expected value (e.g. the top team's odds) so bars stay readable. For two-sided splits, use a fixed `fill` color per side.

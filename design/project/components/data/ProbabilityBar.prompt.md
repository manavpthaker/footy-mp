**ProbabilityBar** — win/draw/loss forecast in one bar. Home = sky, Draw = slate, Away = pitch-green. Values should sum to 100.

```jsx
<ProbabilityBar home={54} draw={26} away={20} homeLabel="BRA win" awayLabel="MAR win" />
```

The draw % auto-hides below 8% to avoid cramped text. Pair with an `xG` line above and a head-to-head comparison below in a match preview.

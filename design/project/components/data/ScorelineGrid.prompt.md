**ScorelineGrid** — the scoreline-distribution matrix for match predictions: home goals down, away goals across, cells tinted pitch-green by probability, modal score solid.

```jsx
// matrix[h][a] = P(h–a), from the Poisson model on each side's xG
<ScorelineGrid home="ARS" away="RMA" matrix={poissonMatrix(1.6, 1.2, 5)} />
```

Keep it 5×5 (0–4 goals) — bigger reads as noise. The method line ("Poisson on expected goals") is built in; don't repeat it beside the grid. Pairs under `ProbabilityBar` in a match-detail prediction module.

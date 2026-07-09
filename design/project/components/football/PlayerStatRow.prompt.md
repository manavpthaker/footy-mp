**PlayerStatRow** — player line whose right side is 1–3 mono figures with micro-labels. Use for golden-boot leaderboards, followed-player dashboards, and projection lists.

```jsx
<PlayerStatRow rank={1} flag="🇳🇴" name="Erling Haaland" meta="Man City · ST"
  followed
  figures={[
    { value: 21, label: 'GLS', accent: true },
    { value: '0.94', label: 'xG/90' },
    { value: 33, label: 'PROJ' },
  ]}
  onClick={() => openPlayer('haaland')} />
```

`accent: true` on the headline figure only. `PROJ` figures come from the model — always pair a projections list with a method line ("Projection = current pace × remaining fixture difficulty"). Distinct from `PlayerCard`, which is the squad-identity tile.

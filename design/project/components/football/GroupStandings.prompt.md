**GroupStandings** — the signature group card. Pass teams already in finishing order; the component draws qualification rails by position, Q/OUT tags by status, and derives GD.

```jsx
<GroupStandings
  group="A"
  teams={[
    { team:'Mexico', flag:'🇲🇽', rank:14, P:3, W:3, D:0, L:0, GF:6, GA:0, Pts:9, status:'qualified' },
    { team:'South Africa', flag:'🇿🇦', rank:60, P:3, W:1, D:1, L:1, GF:2, GA:3, Pts:4, status:'qualified' },
    { team:'South Korea', flag:'🇰🇷', rank:25, P:3, W:1, D:0, L:2, GF:2, GA:3, Pts:3, status:'active' },
    { team:'Czech Republic', flag:'🇨🇿', rank:40, P:3, W:0, D:1, L:2, GF:2, GA:6, Pts:1, status:'eliminated' },
  ]}
  onSelect={(t) => openTeam(t)}
/>
```

Rails: 1st = green, 2nd = sky, 3rd = amber, eliminated = red + dimmed. Figures render in the mono/tabular voice; team names and the FIFA-rank subline are UI text.

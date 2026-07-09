**LeagueTable** — full-season standings. Same anatomy as `GroupStandings` but the 3px inset rail marks **league zones**, not group fate: `ucl` green · `uel` sky · `conf` amber · `releg` red. Followed teams get a gold ★.

```jsx
<LeagueTable
  onSelect={(team) => openTeam(team)}
  rows={[
    { team:'Arsenal',   flag:'🔴', P:24, W:17, D:5, L:2, GD:+34, Pts:56, zone:'ucl',  form:['W','W','D','W','W'], followed:true },
    { team:'Liverpool', flag:'🔴', P:24, W:16, D:6, L:2, GD:+30, Pts:54, zone:'ucl',  form:['W','D','W','W','D'] },
    { team:'Brighton',  flag:'🔵', P:24, W:10, D:8, L:6, GD:+8,  Pts:38, zone:'uel',  form:['D','W','L','W','D'] },
    { team:'Everton',   flag:'🔵', P:24, W:4,  D:6, L:14, GD:-18, Pts:18, zone:'releg', form:['L','L','D','L','L'] },
  ]}
/>
```

Rows are ordered by you; `pos` overrides the index. `showForm={false}` for narrow rails. Pair the zone rails with a small legend of `Tag`s below the table.

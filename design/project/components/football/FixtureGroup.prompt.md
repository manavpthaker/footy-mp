**FixtureGroup** — header + container that groups `MatchRow`s by date or competition in a match-center rail.

```jsx
<FixtureGroup label="Today" right={<CompetitionBadge code="UCL" name="Champions League" tone="gold" />}>
  <MatchRow homeFlag="🔴" home="ARS" awayFlag="⚪" away="RMA"
    right={<span style={{color:'var(--status-live)',fontWeight:700,fontSize:11}}>● 64′ 1–1</span>} />
  <MatchRow homeFlag="🔵" home="MCI" awayFlag="🔴" away="BAY"
    right={<span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-faint)'}}>20:00</span>} />
</FixtureGroup>
```

Label is a date, "LIVE", or "TODAY". Purely compositional — it owns the rhythm (7px header gap, 14px between groups), MatchRow owns the rows.

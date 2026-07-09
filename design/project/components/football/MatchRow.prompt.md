**MatchRow** — tappable fixture/result line. The `right` slot carries whatever readout fits the context.

```jsx
// upcoming fixture → preview affordance
<MatchRow date="Jun 29" homeFlag="🇧🇷" home="BRA" awayFlag="🇯🇵" away="JPN"
  right={<span style={{color:'var(--accent-2)',fontWeight:700,fontSize:11}}>PREVIEW →</span>} />

// played result → score
<MatchRow date="Jun 24" homeFlag="🏴" home="SCO" awayFlag="🇧🇷" away="BRA"
  right={<b style={{fontFamily:'var(--font-mono)'}}>0–3</b>} />

// forecast → favorite
<MatchRow date="Jul 1" homeFlag="🇺🇸" home="USA" awayFlag="🇧🇦" away="BIH"
  right={<span style={{color:'var(--accent)',fontWeight:700}}>61% win</span>} />
```

Use short team codes for dense rails. Pair with `FormPills` or a live `●` badge inside `right`.

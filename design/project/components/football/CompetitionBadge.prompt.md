**CompetitionBadge** — lettermark chip naming the competition. Use it in fixture-group headers, match cards, and league pages. Tone carries category: **gold** cups/UCL · **sky** domestic leagues · **pitch** international · neutral otherwise.

```jsx
<CompetitionBadge code="UCL" name="Champions League" tone="gold" />
<CompetitionBadge code="EPL" name="Premier League" tone="sky" />
<CompetitionBadge code="WCQ" name="WC26 Qualifiers" tone="pitch" />
<CompetitionBadge code="LIB" name="Copa Libertadores" tone="neutral" size="md" />
```

Mark alone (`name` omitted) works inline in dense rows. Codes stay 2–3 chars, UPPERCASE — they're the system's competition shorthand (EPL, LAL, SA, BUN, L1, UCL, LIB, MLS, LMX, WCQ, UNL).

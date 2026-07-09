**PlayerCard** — squad member tile. Lay several in a `repeat(auto-fill, minmax(186px,1fr))` grid, grouped by position.

```jsx
<PlayerCard lead={25} name="Vinícius Júnior" club="Real Madrid" caps={42} isKey />
<PlayerCard lead={26} name="Bruno Guimarães" club="Newcastle" caps={38} />
```

`lead` is usually age (matching the source app) or shirt number. `isKey` flags a star player (green border + ★). Omit `caps` for compact "key players" columns in a match preview.

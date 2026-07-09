**FollowButton** — the personalization primitive. Gold ★ = followed (matches the `--follow` token and the ★ that appears on followed rows elsewhere).

```jsx
<FollowButton following={isFollowed} onToggle={(next) => setFollowed(next)} />

// compact, icon-only — for dense rows and table cells
<FollowButton following label={false} onToggle={toggle} />
```

It stops click propagation, so it's safe inside clickable rows (`MatchRow`, `PlayerStatRow`). Never use pitch-green for follow state — gold is the follow color, green means qualification/wins.

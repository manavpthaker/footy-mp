**FactorBar** — one driver of the composite rating as a signed z-score, anchored to a center midline. Stack the model's six factors to explain a rating.

```jsx
<FactorBar label="FIFA base" z={1.42} />
<FactorBar label="Form" z={0.31} />
<FactorBar label="Defense" z={-0.58} />
```

Right of center / green = above the 48-team average; left / red = below; near-zero = neutral slate. The value renders in mono with an explicit + sign.

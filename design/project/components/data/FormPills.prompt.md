**FormPills** — recent-form streak as W/D/L pills (green / slate / red).

```jsx
<FormPills results="WWDLW" />
<FormPills results={['W','D','W']} size={18} titles={['vs HAI 1-0','@ MAR 1-1','vs SCO 3-0']} />
```

Accepts a string or array. Use `size` 18 for inline contexts (match preview) and 22 for the team stat strip. Pass `titles` for hover detail.

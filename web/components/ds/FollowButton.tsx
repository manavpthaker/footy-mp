// @ts-nocheck  — DS prototype JSX ported as-is; typed via the design-system .d.ts files.
"use client";
import React from 'react';

/**
 * FollowButton — the personalization primitive: a gold-star toggle for
 * following a player, team, or league. Idle = hollow ☆ outline pill;
 * following = gold-tint fill with ★. `label` adds "Follow"/"Following"
 * text; omit it for the compact icon-only form in dense rows.
 */
export function FollowButton({ following = false, onToggle, label = true, style = {}, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle && onToggle(!following); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-pressed={following}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: label ? '5px 11px' : '5px 7px',
        borderRadius: 'var(--radius-pill)', cursor: 'pointer',
        fontFamily: 'var(--font-ui)', fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-bold)', lineHeight: 1,
        background: following ? 'var(--follow-tint)' : 'transparent',
        color: following ? 'var(--follow)' : hover ? 'var(--text-primary)' : 'var(--text-muted)',
        border: `1px solid ${following ? 'rgba(255,206,83,0.45)' : hover ? 'var(--accent-2)' : 'var(--border)'}`,
        transition: 'border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
        ...style,
      }}
      {...rest}
    >
      <span style={{ fontSize: '12px', lineHeight: 1 }}>{following ? '★' : '☆'}</span>
      {label && (following ? 'Following' : 'Follow')}
    </button>
  );
}

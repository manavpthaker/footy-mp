import React from 'react';

/**
 * Button — the system's primary action control.
 * Variants map to the visualizer's CTAs: pitch-green primary ("Auto-fill by model"),
 * trophy gold ("champion" actions), secondary (panel + border), ghost (bare).
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  iconLeft = null,
  iconRight = null,
  disabled = false,
  children,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { padding: '6px 11px', fontSize: 'var(--fs-xs)' },
    md: { padding: '8px 14px', fontSize: 'var(--fs-sm)' },
    lg: { padding: '11px 18px', fontSize: 'var(--fs-body)' },
  };

  const variants = {
    primary: {
      background: 'var(--grad-pitch)',
      color: 'var(--text-on-pitch)',
      border: '1px solid transparent',
      boxShadow: 'var(--shadow-accent)',
    },
    gold: {
      background: 'var(--grad-gold)',
      color: 'var(--text-on-gold)',
      border: '1px solid transparent',
    },
    secondary: {
      background: 'var(--surface-panel)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
      border: '1px solid transparent',
    },
  };

  return (
    <button
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '7px',
        fontFamily: 'var(--font-ui)',
        fontWeight: 'var(--fw-bold)',
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        whiteSpace: 'nowrap',
        lineHeight: 1,
        transition: 'transform var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
        ...sizes[size],
        ...variants[variant],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'secondary' || variant === 'ghost') e.currentTarget.style.borderColor = 'var(--accent-2)';
        if (variant === 'secondary') e.currentTarget.style.color = 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
        if (variant === 'secondary') e.currentTarget.style.borderColor = 'var(--border)';
        if (variant === 'ghost') e.currentTarget.style.borderColor = 'transparent';
      }}
      {...rest}
    >
      {iconLeft && <span style={{ display: 'inline-flex', fontSize: '1.05em' }}>{iconLeft}</span>}
      {children}
      {iconRight && <span style={{ display: 'inline-flex', fontSize: '1.05em' }}>{iconRight}</span>}
    </button>
  );
}

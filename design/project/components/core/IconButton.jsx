import React from 'react';

/**
 * IconButton — square 34px control used in the header rail (sync ⟳, gear ⚙, search).
 * `active` gives the pitch-green spinning/engaged state.
 */
export function IconButton({ size = 34, active = false, title, children, style = {}, ...rest }) {
  return (
    <button
      title={title}
      aria-label={title}
      style={{
        width: size,
        height: size,
        flex: '0 0 auto',
        display: 'grid',
        placeItems: 'center',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-panel)',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--accent-2)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = active ? 'var(--accent)' : 'var(--text-muted)'; e.currentTarget.style.borderColor = active ? 'var(--accent)' : 'var(--border)'; }}
      {...rest}
    >
      {children}
    </button>
  );
}

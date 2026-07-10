// @ts-nocheck  — DS prototype JSX ported as-is; typed via the design-system .d.ts files.
"use client";
import React from 'react';

/**
 * FixtureGroup — grouping shell for fixture rails: an uppercase label
 * (a date, "LIVE", "TODAY") with an optional right-side slot (usually a
 * CompetitionBadge), over its MatchRow children. Composes; renders nothing
 * itself but the header.
 */
export function FixtureGroup({ label, right = undefined, children, style = {}, ...rest }) {
  return (
    <div style={{ marginBottom: '14px', ...style }} {...rest}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
        padding: '0 2px', marginBottom: '7px',
      }}>
        <span style={{
          fontSize: 'var(--fs-2xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)',
          color: 'var(--text-faint)', fontWeight: 'var(--fw-bold)', fontFamily: 'var(--font-ui)',
        }}>{label}</span>
        {right}
      </div>
      {children}
    </div>
  );
}

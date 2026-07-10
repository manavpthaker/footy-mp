// @ts-nocheck  — DS prototype JSX ported as-is; typed via the design-system .d.ts files.
"use client";
import React from 'react';

const marks = {
  pitch: { bg: 'var(--grad-pitch)', ink: 'var(--text-on-pitch)' },
  sky:   { bg: 'var(--grad-sky)',   ink: 'var(--text-on-sky)' },
  gold:  { bg: 'var(--grad-gold)',  ink: 'var(--text-on-gold)' },
  neutral: { bg: 'var(--surface-raised)', ink: 'var(--text-muted)' },
};

/**
 * CompetitionBadge — identifies which competition a fixture/table belongs to:
 * a lettermark square (2–3 char code) + optional full name. Tones map to the
 * accent gradients — gold for cups/UCL, sky for leagues, pitch for
 * international, neutral for everything else.
 */
export function CompetitionBadge({ code, name = undefined, tone = 'neutral', size = 'sm', style = {}, ...rest }) {
  const m = marks[tone] || marks.neutral;
  const box = size === 'md' ? 22 : 17;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap', verticalAlign: 'middle', ...style,
    }} {...rest}>
      <span style={{
        width: `${box}px`, height: `${box}px`, borderRadius: 'var(--radius-xs)',
        background: m.bg, color: m.ink, display: 'inline-grid', placeItems: 'center',
        fontSize: size === 'md' ? 'var(--fs-2xs)' : '8px', fontWeight: 'var(--fw-extrabold)',
        letterSpacing: '0.02em', fontFamily: 'var(--font-display)', flex: '0 0 auto',
      }}>{code}</span>
      {name && (
        <span style={{
          fontSize: size === 'md' ? 'var(--fs-sm)' : 'var(--fs-xs)',
          color: 'var(--text-muted)', fontWeight: 'var(--fw-semibold)',
        }}>{name}</span>
      )}
    </span>
  );
}

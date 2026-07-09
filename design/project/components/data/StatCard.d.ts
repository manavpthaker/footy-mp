import React from 'react';

/**
 * Props for the labelled metric tile.
 * @startingPoint section="Data" subtitle="Labelled metric tile" viewport="700x150"
 */
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Uppercase eyebrow label, e.g. "FIFA World Rank". */
  label: React.ReactNode;
  /** The figure (rendered in the mono/tabular voice). */
  value: React.ReactNode;
  /** Small dim suffix, e.g. ":1" or "W-D-L". */
  unit?: React.ReactNode;
  /** Override value color (e.g. var(--accent) for a highlighted metric). */
  accent?: string;
}

/**
 * Labelled metric tile used across team and match detail views.
 */
export function StatCard(props: StatCardProps): JSX.Element;

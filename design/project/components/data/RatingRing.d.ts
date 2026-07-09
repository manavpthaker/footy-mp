import React from 'react';

export interface RatingRingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The rating figure shown in the hub and used to fill the ring. */
  value: number;
  /** Scale maximum. @default 99 */
  max?: number;
  /** Diameter in px. @default 64 */
  size?: number;
  /** Fill color of the arc. @default 'var(--accent)' */
  color?: string;
  /** Optional uppercase caption beneath the ring. */
  label?: React.ReactNode;
}

/** Conic-gradient strength dial for a team's composite rating (0–99). */
export function RatingRing(props: RatingRingProps): JSX.Element;

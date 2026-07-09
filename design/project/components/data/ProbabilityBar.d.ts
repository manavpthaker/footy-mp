import React from 'react';

export interface ProbabilityBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Home win % (integer). Rendered sky-blue. */
  home: number;
  /** Draw % (integer). Rendered slate; hidden below 8%. */
  draw: number;
  /** Away win % (integer). Rendered pitch-green. */
  away: number;
  /** Label under the home segment, e.g. "BRA win". */
  homeLabel?: React.ReactNode;
  /** Label under the away segment. */
  awayLabel?: React.ReactNode;
  /** Bar height in px. @default 34 */
  height?: number;
}

/** Three-segment win/draw/loss forecast bar — the core match-odds readout. */
export function ProbabilityBar(props: ProbabilityBarProps): JSX.Element;

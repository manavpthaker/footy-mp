import React from 'react';

export interface BarMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current magnitude. */
  value: number;
  /** Scale maximum. @default 100 */
  max?: number;
  /** Track height in px. @default 7 */
  height?: number;
  /** CSS background for the fill. @default pitch→sky gradient */
  fill?: string;
  /** CSS background for the track. */
  track?: string;
}

/** Thin horizontal magnitude bar — title odds, possession splits, generic proportions. */
export function BarMeter(props: BarMeterProps): JSX.Element;

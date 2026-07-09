import React from 'react';

export interface FactorBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Short uppercase factor name, e.g. "Attack", "Form", "FIFA base". */
  label: React.ReactNode;
  /** Signed z-score across the 48-team field; drives bar direction + color. */
  z: number;
}

/** A single rating driver as a signed, center-anchored z-score bar (green = above field, red = below). */
export function FactorBar(props: FactorBarProps): JSX.Element;

import React from 'react';

export interface ScorelineGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Home team short name/code (rows = home goals). */
  home?: React.ReactNode;
  /** Away team short name/code (columns = away goals). */
  away?: React.ReactNode;
  /** matrix[h][a] = P(home scores h, away scores a), in [0,1]. Typically 5×5 (0–4 goals). */
  matrix: number[][];
  /** Override the peak used for tint scaling; defaults to matrix max. */
  max?: number;
}

/** Poisson scoreline-distribution heat matrix; modal score gets the solid pitch fill. */
export function ScorelineGrid(props: ScorelineGridProps): JSX.Element;

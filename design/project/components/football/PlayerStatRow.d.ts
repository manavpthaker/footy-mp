import React from 'react';

export interface PlayerStatFigure {
  /** Mono figure, e.g. 19 or "0.82". */
  value: React.ReactNode;
  /** Micro-label under it, e.g. "GLS", "xG/90", "PROJ". */
  label: React.ReactNode;
  /** Pitch-green figure for the headline stat. */
  accent?: boolean;
}

export interface PlayerStatRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Leaderboard rank; omit outside leaderboards. */
  rank?: number;
  /** Nationality flag emoji. */
  flag?: React.ReactNode;
  name: React.ReactNode;
  /** Subline: "Real Madrid · LW". */
  meta?: React.ReactNode;
  /** Up to ~3 figures, right-aligned. */
  figures?: PlayerStatFigure[];
  /** Gold ★ after the name. */
  followed?: boolean;
  onClick?: () => void;
}

/** Player line with mono stat figures — leaderboards & followed-player modules. */
export function PlayerStatRow(props: PlayerStatRowProps): JSX.Element;

import React from 'react';

export interface MatchRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Short date, e.g. "Jun 29". */
  date?: React.ReactNode;
  homeFlag?: React.ReactNode;
  home: React.ReactNode;
  awayFlag?: React.ReactNode;
  away: React.ReactNode;
  /** Right-side readout: score, W/D/L pill, "54% win", live badge, or "PREVIEW →". */
  right?: React.ReactNode;
  onClick?: () => void;
}

/** Tappable fixture/result line for rails and team match lists. */
export function MatchRow(props: MatchRowProps): JSX.Element;

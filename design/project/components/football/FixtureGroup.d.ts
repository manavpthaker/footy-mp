import React from 'react';

export interface FixtureGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Uppercase group label: a date ("SAT JUL 11"), "LIVE", "TODAY". */
  label: React.ReactNode;
  /** Right-side slot — usually a CompetitionBadge. */
  right?: React.ReactNode;
  /** MatchRow children. */
  children?: React.ReactNode;
}

/** Grouping header + container for MatchRow rails (by date or competition). */
export function FixtureGroup(props: FixtureGroupProps): JSX.Element;

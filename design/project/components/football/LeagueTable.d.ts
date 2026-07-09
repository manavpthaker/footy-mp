import React from 'react';

export type LeagueZone = 'ucl' | 'uel' | 'conf' | 'releg';

export interface LeagueTableRow {
  /** Explicit position; defaults to index + 1. */
  pos?: number;
  team: string;
  /** Flag or crest emoji; falls back to ⚽. */
  flag?: React.ReactNode;
  P: number; W: number; D: number; L: number;
  GD: number; Pts: number;
  /** League-zone rail: ucl green / uel sky / conf amber / releg red. */
  zone?: LeagueZone | null;
  /** Last-5 form, most recent last, e.g. ['W','W','D','L','W']. */
  form?: Array<'W' | 'D' | 'L'>;
  /** Gold ★ marks a followed team. */
  followed?: boolean;
}

export interface LeagueTableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Rows ALREADY ordered by position. */
  rows: LeagueTableRow[];
  onSelect?: (team: string) => void;
  /** Show the last-5 form column. Default true. */
  showForm?: boolean;
}

/** Full-season league standings with zone rails, form, and follow stars. */
export function LeagueTable(props: LeagueTableProps): JSX.Element;

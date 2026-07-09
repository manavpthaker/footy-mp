import React from 'react';

export interface StandingRow {
  team: string;
  /** Flag emoji (or any glyph). */
  flag?: string;
  rank: number;
  P: number; W: number; D: number; L: number;
  GF: number; GA: number; Pts: number;
  /** 'qualified' | 'eliminated' | 'active' — drives Q/OUT tag and dimming. */
  status?: 'qualified' | 'eliminated' | 'active';
}

/**
 * Props for the signature standings card.
 * @startingPoint section="Football" subtitle="Group standings table card" viewport="460x300"
 */
export interface GroupStandingsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Group letter, e.g. "A". */
  group: string;
  /** Teams in finishing order (top → bottom). GD is derived from GF/GA. */
  teams: StandingRow[];
  /** Row click handler. */
  onSelect?: (team: string) => void;
}

/**
 * The signature standings card — group header + dense table with qualification
 * rails (1st green / 2nd sky / 3rd amber / out red), Q/OUT tags and FIFA ranks.
 */
export function GroupStandings(props: GroupStandingsProps): JSX.Element;

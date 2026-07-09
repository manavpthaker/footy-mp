import React from 'react';

export interface CompetitionBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 2–3 character lettermark, e.g. "EPL", "UCL", "LIB", "WCQ". */
  code: string;
  /** Full name shown beside the mark; omit for the mark alone. */
  name?: React.ReactNode;
  /** gold = cups/UCL · sky = leagues · pitch = international · neutral = rest. */
  tone?: 'pitch' | 'sky' | 'gold' | 'neutral';
  size?: 'sm' | 'md';
}

/** Lettermark chip identifying a competition. */
export function CompetitionBadge(props: CompetitionBadgeProps): JSX.Element;

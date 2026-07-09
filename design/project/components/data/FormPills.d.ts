import React from 'react';

export interface FormPillsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Results as a string ("WWDLW") or array (['W','D','L']). */
  results: string | Array<'W' | 'D' | 'L'>;
  /** Pill px size. @default 22 */
  size?: number;
  /** Optional per-pill tooltips, parallel to results (e.g. "vs MAR 1-1"). */
  titles?: string[];
}

/** Recent-form streak as colored W/D/L pills (green/slate/red). */
export function FormPills(props: FormPillsProps): JSX.Element;

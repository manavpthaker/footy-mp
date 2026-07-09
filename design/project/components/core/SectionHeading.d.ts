import React from 'react';

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** CSS color for the leading tick. @default 'var(--accent)' */
  tick?: string;
  /** Optional right-aligned content (a value, link, or count). */
  trailing?: React.ReactNode;
  children?: React.ReactNode;
}

/** Uppercase block divider with an accent tick — opens each analytical section in a detail view. */
export function SectionHeading(props: SectionHeadingProps): JSX.Element;

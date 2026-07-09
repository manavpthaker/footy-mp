import React from 'react';

export type TagTone = 'qualified' | 'out' | 'pill' | 'accent' | 'gold';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Status meaning. @default 'pill' */
  tone?: TagTone;
  children?: React.ReactNode;
}

/** Small status chip — qualification (Q / OUT), neutral pills, accent chips, champion gold. */
export function Tag(props: TagProps): JSX.Element;

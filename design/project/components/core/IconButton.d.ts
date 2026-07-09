import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Square px dimension. @default 34 */
  size?: number;
  /** Engaged/active state (pitch-green border + icon). @default false */
  active?: boolean;
  /** Accessible label + tooltip. */
  title?: string;
  children?: React.ReactNode;
}

/** Square icon control for the header rail — sync, model settings, search affordances. */
export function IconButton(props: IconButtonProps): JSX.Element;

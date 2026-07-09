import React from 'react';

export interface FollowButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onToggle'> {
  /** Current state — following shows a gold ★ fill. */
  following?: boolean;
  /** Called with the NEXT state on click. */
  onToggle?: (next: boolean) => void;
  /** Show "Follow"/"Following" text; false = icon-only compact pill. */
  label?: boolean;
}

/** Gold-star follow toggle for players, teams, and leagues. */
export function FollowButton(props: FollowButtonProps): JSX.Element;

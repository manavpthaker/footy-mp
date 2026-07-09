import React from 'react';

export interface PlayerCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Figure in the lead box — typically age or shirt number. */
  lead: React.ReactNode;
  name: React.ReactNode;
  /** Club / team line. */
  club: React.ReactNode;
  /** International caps (mono figure on the right). */
  caps?: number;
  /** Star player — green border, pitch lead box, ★ badge. @default false */
  isKey?: boolean;
  onClick?: () => void;
}

/** Squad member tile used in team detail and "key players" lists. */
export function PlayerCard(props: PlayerCardProps): JSX.Element;

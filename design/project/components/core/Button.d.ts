import React from 'react';

export type ButtonVariant = 'primary' | 'gold' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for the primary action button.
 * @startingPoint section="Core" subtitle="Pitch/gold/secondary action buttons" viewport="700x140"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `primary` = pitch-green CTA, `gold` = champion action. @default 'secondary' */
  variant?: ButtonVariant;
  /** @default 'md' */
  size?: ButtonSize;
  /** Glyph/emoji/SVG before the label. */
  iconLeft?: React.ReactNode;
  /** Glyph/emoji/SVG after the label (e.g. an arrow). */
  iconRight?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Primary action button for the WC26 visualizer (model controls, bracket actions, CTAs).
 */
export function Button(props: ButtonProps): JSX.Element;

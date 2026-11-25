'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import styles from '@/styles/pressable.module.css';

/**
 * Two real weights: one filled yellow CTA and one quiet outline action.
 * `default` and `outline` remain as aliases so existing call sites keep
 * compiling without editing them; they now map onto those two weights instead
 * of offering a second forest-filled button that fought the CTA for attention.
 * All standard button/ARIA attributes are forwarded to the DOM, so callers can
 * supply an accessible name (aria-label), state (aria-busy, aria-pressed) or
 * relationships (aria-describedby).
 */
type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'default'
  | 'outline'
  | 'ghost'
  | 'destructive';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const baseStyles = [
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap',
  'rounded-md px-4 py-2 text-sm font-medium',
  styles.press,
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'disabled:opacity-50',
].join(' ');

/** One filled action per view; every peer uses `secondary` or `ghost`. */
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-cta text-cta-foreground hover:bg-cta-hover',
  secondary:
    'border border-border-strong bg-card text-primary hover:bg-secondary',
  // Backwards-compatible aliases. `default` is the CTA, `outline` the peer.
  default: 'bg-cta text-cta-foreground hover:bg-cta-hover',
  outline: 'border border-border-strong bg-card text-primary hover:bg-secondary',
  ghost: 'text-primary hover:bg-secondary',
  destructive: 'bg-[#b23c26] text-[#fffefa] hover:bg-[#9d3328]',
};

export function Button({
  children,
  className = '',
  variant = 'default',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      {children}
    </button>
  );
}

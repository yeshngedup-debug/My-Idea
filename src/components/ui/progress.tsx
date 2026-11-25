import * as React from 'react';
import { cn } from '@/lib/utils';

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value: number;
  /** Accessible name for the progressbar (WCAG 4.1.2 Name, Role, Value). */
  label?: string;
};

export function Progress({
  value,
  label = 'Progress',
  className,
  'aria-label': ariaLabel,
  ...props
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={ariaLabel ?? label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-[#0b2e2e]/10', className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-[#0b5c5c] transition-[width] duration-250 ease-[var(--ease-out)] motion-reduce:transition-none"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

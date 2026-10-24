import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'outline';

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-amber-400 text-black',
  secondary: 'bg-white/10 text-white border border-white/10',
  outline: 'border border-white/20 text-white/80 bg-transparent',
};

export function Badge({
  className,
  variant = 'secondary',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

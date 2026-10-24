import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:border-amber-400/60 disabled:cursor-not-allowed disabled:opacity-50 transition-all [color-scheme:dark]',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };

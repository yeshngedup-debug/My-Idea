import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Additive a11y props with no-op defaults: existing callers render exactly the
 * same markup as before.
 */
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Sets aria-invalid="true" when true; omitted otherwise. */
  invalid?: boolean;
  /** Id(s) merged into any existing aria-describedby value. */
  describedBy?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      invalid,
      describedBy,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      aria-describedby={
        describedBy
          ? [ariaDescribedBy, describedBy].filter(Boolean).join(' ')
          : ariaDescribedBy
      }
      className={cn(
        'flex min-h-11 w-full rounded-lg border border-input bg-background px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea] focus-visible:border-[#d84f37] disabled:cursor-not-allowed disabled:opacity-50 transition-[border-color,box-shadow,opacity] duration-150 ease-[var(--ease-out)]',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };

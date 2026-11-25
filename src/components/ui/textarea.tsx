import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Additive a11y props with no-op defaults: existing callers render exactly the
 * same markup as before.
 */
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Sets aria-invalid="true" when true; omitted otherwise. */
  invalid?: boolean;
  /** Id(s) merged into any existing aria-describedby value. */
  describedBy?: string;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, invalid, describedBy, 'aria-describedby': ariaDescribedBy, ...props },
    ref
  ) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      aria-describedby={
        describedBy
          ? [ariaDescribedBy, describedBy].filter(Boolean).join(' ')
          : ariaDescribedBy
      }
      className={cn(
        'flex min-h-[96px] w-full rounded-lg border border-input bg-background px-4 py-3 text-base sm:text-sm leading-normal text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6] focus-visible:border-[#ff0063] disabled:cursor-not-allowed disabled:opacity-50 transition-[border-color,box-shadow,opacity] duration-150 ease-[var(--ease-out)]',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export { Textarea };

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Additive `required` prop with a no-op default: existing callers render
 * exactly the same markup as before. When set, the visual marker is hidden
 * from assistive tech because the associated control carries aria-required.
 */
type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('block text-sm font-medium text-foreground', className)}
      {...props}
    >
      {children}
      {required && <span aria-hidden="true"> *</span>}
    </label>
  )
);
Label.displayName = 'Label';

export { Label };

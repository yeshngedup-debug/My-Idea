import type { ReactNode } from "react";

/**
 * Static compatibility wrapper for the older marketing pages.
 *
 * The marketplace redesign does not use scroll-triggered entrances. Content
 * must be present, readable and focusable in the server response and in the
 * first client paint. The `delay` prop remains in the public type so existing
 * call sites do not need a separate migration.
 */
export function MarketingReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return <div className={className}>{children}</div>;
}

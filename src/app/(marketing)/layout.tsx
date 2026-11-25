import type { ReactNode } from 'react';

/**
 * Public/marketing shell. Kept intentionally thin: global providers live in
 * the root layout, and public pages do not need an auth guard.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

import type { ReactNode } from 'react';

/**
 * Authenticated application shell. Session checks stay in proxy.ts and are
 * re-verified inside each page/server action, so this layout adds no guard.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

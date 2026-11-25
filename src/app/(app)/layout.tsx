import type { ReactNode } from 'react';

/**
 * Authenticated application shell. Session checks stay in proxy.ts and are
 * re-verified inside each page/server action, so this layout adds no guard.
 * These routes read cookies through Neon Auth, so they must render on demand.
 */
export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

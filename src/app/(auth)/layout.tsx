import type { ReactNode } from 'react';

/**
 * Auth shell. Each auth page renders its own AuthShell; this group layout only
 * provides a stable boundary so future shared auth chrome has a home.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

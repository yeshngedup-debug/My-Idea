import type { ReactNode } from 'react';

/**
 * Authenticated application shell. Session checks stay in proxy.ts and are
 * re-verified inside each page/server action, so this layout adds no guard.
 * These routes read cookies through Neon Auth, so they must render on demand.
 */
export const dynamic = 'force-dynamic';

/* Presentation only: one quiet entrance on first load. `backwards` leaves no
   lingering transform, so sticky children keep their normal containing block. */
const shellEntranceStyles = `
@keyframes btc-workspace-shell-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.btc-workspace-shell {
  animation: btc-workspace-shell-in 200ms cubic-bezier(.22, 1, .36, 1) backwards;
}
@media (prefers-reduced-motion: reduce) {
  .btc-workspace-shell { animation: none; }
}
`;

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{shellEntranceStyles}</style>
      <div className="btc-workspace-shell">{children}</div>
    </>
  );
}

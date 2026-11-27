/**
 * Shared loading shape — mirrors the standard dashboard shell
 * (mobile top bar, desktop sidebar, card list) so navigation feels
 * instant instead of blank while server components stream in.
 *
 * Static by design: no pulse or shimmer, and a single visible message.
 */
export function PageSkeleton({ label }: { label: string }) {
  return (
    <div
      className="min-h-screen bg-[#eaf6f6] text-[#0b2e2e]"
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[#0b2e2e]/10 bg-[#eaf6f6] px-4 lg:hidden">
        <div className="h-4 w-28 rounded bg-[#0b2e2e]/10" />
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-72 flex-col gap-3 border-r border-[#0b2e2e]/10 bg-[#eaf6f6] p-6 lg:flex">
        <div className="h-5 w-36 rounded bg-[#0b2e2e]/10" />
        <div className="h-9 w-full rounded-lg bg-[#0b2e2e]/5" />
        <div className="h-9 w-full rounded-lg bg-[#0b2e2e]/5" />
      </aside>

      {/* Content */}
      <main className="mx-auto max-w-2xl space-y-3 px-4 py-5 sm:px-6 sm:space-y-4 sm:py-6 lg:mx-0 lg:ml-72 lg:max-w-none lg:px-10 lg:py-10">
        <div className="flex items-center justify-between gap-3">
          <div className="h-7 w-40 rounded bg-[#0b2e2e]/10" />
          <span className="text-xs text-body-secondary">Loading {label}…</span>
        </div>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-[#0b2e2e]/10 bg-[#ffffff] sm:h-32"
          />
        ))}
      </main>
    </div>
  );
}

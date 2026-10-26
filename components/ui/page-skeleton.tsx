/**
 * Shared loading skeleton — mirrors the standard dashboard shell
 * (mobile top bar, desktop sidebar, card list) so navigation feels
 * instant instead of blank while server components stream in.
 */
export function PageSkeleton({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-[#0c0b10] text-white" role="status" aria-label="Loading">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0c0b10]/90 backdrop-blur-md border-b border-white/10 px-4 h-14 flex items-center gap-3">
        <div className="h-4 w-28 rounded bg-white/10 animate-pulse" />
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white/[0.03] backdrop-blur-xl border-r border-white/10 flex-col p-6 gap-3">
        <div className="h-5 w-36 rounded bg-white/10 animate-pulse" />
        <div className="h-9 w-full rounded-xl bg-white/5 animate-pulse" />
        <div className="h-9 w-full rounded-xl bg-white/5 animate-pulse" />
      </aside>

      {/* Content */}
      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10 max-w-2xl mx-auto lg:max-w-none lg:mx-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-7 w-40 rounded bg-white/10 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-white/40">{label}</span>
        </div>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 rounded-3xl bg-white/[0.04] border border-white/10 animate-pulse"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </main>
    </div>
  );
}

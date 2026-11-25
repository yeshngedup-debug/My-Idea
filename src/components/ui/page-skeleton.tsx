/**
 * Shared loading skeleton — mirrors the standard dashboard shell
 * (mobile top bar, desktop sidebar, card list) so navigation feels
 * instant instead of blank while server components stream in.
 */
export function PageSkeleton({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-[#f5f2ea] text-[#18251f]" role="status" aria-label="Loading">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#f5f2ea]/90 backdrop-blur-md border-b border-[#18251f]/10 px-4 h-14 flex items-center gap-3">
        <div className="h-4 w-28 rounded bg-[#18251f]/10 animate-pulse motion-reduce:animate-none" />
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-[#eeeae1]/70 backdrop-blur-xl border-r border-[#18251f]/10 flex-col p-6 gap-3">
        <div className="h-5 w-36 rounded bg-[#18251f]/10 animate-pulse motion-reduce:animate-none" />
        <div className="h-9 w-full rounded-lg bg-[#18251f]/5 animate-pulse motion-reduce:animate-none" />
        <div className="h-9 w-full rounded-lg bg-[#18251f]/5 animate-pulse motion-reduce:animate-none" />
      </aside>

      {/* Content */}
      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10 max-w-2xl mx-auto lg:max-w-none lg:mx-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-7 w-40 rounded bg-[#18251f]/10 animate-pulse motion-reduce:animate-none" />
          <span className="text-xs uppercase tracking-widest text-body-secondary">{label}</span>
        </div>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-[#fffefa] border border-[#18251f]/10 animate-pulse motion-reduce:animate-none"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </main>
    </div>
  );
}

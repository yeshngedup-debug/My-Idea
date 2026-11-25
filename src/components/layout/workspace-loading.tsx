/**
 * Static loading shape for a workspace overview. No pulse or shimmer animation;
 * the layout matches the loaded page so nothing jumps into place.
 */
export function WorkspaceLoading({
  label,
  ledgerRows = 3,
  listRows = 3,
}: {
  label: string;
  ledgerRows?: number;
  listRows?: number;
}) {
  return (
    <div
      className="space-y-6 sm:space-y-8"
      role="status"
      aria-busy="true"
      aria-label={`Loading ${label} workspace`}
    >
      <div className="rounded-[1.5rem] border border-[#b9dede]/80 bg-[#dff0f0]/55 p-1.5 shadow-[0_14px_34px_-32px_rgba(11,92,92,0.5)]">
        <div className="workspace-paper flex h-24 items-end rounded-[calc(1.5rem_-_0.375rem)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:h-32">
          <div className="h-3 w-28 rounded bg-white/80" />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6 border-y border-[#b9dede]/80 py-5 sm:gap-10 sm:py-6">
        <div className="col-span-12 min-w-0 sm:col-span-5">
          <div className="h-3 w-24 rounded bg-[#eaf6f6]" />
          <div className="mt-3 h-10 w-20 rounded bg-[#b9dede]" />
        </div>
        <div className="col-span-12 min-w-0 space-y-3 sm:col-span-7">
          {Array.from({ length: ledgerRows }, (_, i) => (
            <div key={i} className="h-3 w-full rounded bg-[#eaf6f6]" />
          ))}
        </div>
      </div>
      <div>
        <div className="mb-3 h-3 w-24 rounded bg-[#eaf6f6]" />
        <div className="divide-y divide-[#b9dede]/80 border-y border-[#b9dede]/80">
          {Array.from({ length: listRows }, (_, i) => (
            <div key={i} className="h-14 sm:h-16" />
          ))}
        </div>
      </div>
      <p className="text-sm text-[#356464]">Loading your workspace…</p>
    </div>
  );
}

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
    <div className="space-y-8" role="status" aria-label={`Loading ${label} workspace`}>
      <div className="workspace-paper flex h-36 items-end rounded-2xl border border-[#17352b]/10 bg-[#17352b] p-5">
        <span className="border border-dashed border-white/25 px-2 py-1 font-mono text-[10px] text-white/70">
          workspace.tsx
        </span>
      </div>
      <div className="grid grid-cols-12 gap-6 border-y border-[#17352b]/10 py-6 sm:gap-10">
        <div className="col-span-12 min-w-0 sm:col-span-5">
          <div className="h-3 w-24 rounded bg-[#ded8cb]" />
          <div className="mt-3 h-12 w-20 rounded bg-[#ded8cb]" />
        </div>
        <div className="col-span-12 min-w-0 space-y-3 sm:col-span-7">
          {Array.from({ length: ledgerRows }, (_, i) => (
            <div key={i} className="h-3 w-full rounded bg-[#eae5d9]" />
          ))}
        </div>
      </div>
      <div>
        <span className="mb-3 inline-block border border-dashed border-[#ded8cb] px-2 py-1 font-mono text-[10px] text-[#657069]">
          queue.tsx
        </span>
        <div className="divide-y divide-[#ded8cb] border-y border-[#ded8cb]">
          {Array.from({ length: listRows }, (_, i) => (
            <div key={i} className="h-16" />
          ))}
        </div>
      </div>
      <span className="text-xs text-[#657069]">Loading</span>
    </div>
  );
}

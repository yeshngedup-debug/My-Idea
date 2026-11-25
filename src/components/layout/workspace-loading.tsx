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
      <div className="workspace-paper flex h-28 items-end rounded-[24px] border border-[#ded8cb] p-5 sm:h-36">
        <span className="border border-dashed border-[#cfc6b6] px-2 py-1 font-mono text-[10px] text-[#56645c]">
          workspace.tsx
        </span>
      </div>
      <div className="grid grid-cols-12 gap-6 border-y border-[#ded8cb] py-5 sm:gap-10 sm:py-6">
        <div className="col-span-12 min-w-0 sm:col-span-5">
          <div className="h-3 w-24 rounded bg-[#eae5d9]" />
          <div className="mt-3 h-10 w-20 rounded bg-[#ded8cb]" />
        </div>
        <div className="col-span-12 min-w-0 space-y-3 sm:col-span-7">
          {Array.from({ length: ledgerRows }, (_, i) => (
            <div key={i} className="h-3 w-full rounded bg-[#eae5d9]" />
          ))}
        </div>
      </div>
      <div>
        <span className="mb-3 inline-block border border-dashed border-[#ded8cb] px-2 py-1 font-mono text-[10px] text-[#56645c]">
          queue.tsx
        </span>
        <div className="divide-y divide-[#ded8cb] border-y border-[#ded8cb]">
          {Array.from({ length: listRows }, (_, i) => (
            <div key={i} className="h-14 sm:h-16" />
          ))}
        </div>
      </div>
      <p className="text-sm text-[#56645c]">Loading your workspace…</p>
    </div>
  );
}

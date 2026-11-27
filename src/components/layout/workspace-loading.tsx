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
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label={`Loading ${label} workspace`}
    >
      <div className="border-b border-[#b9dede] pb-6">
        <div className="h-3 w-24 rounded bg-[#b9dede]" />
        <div className="mt-3 h-7 w-3/4 rounded bg-[#b9dede]" />
        <div className="mt-3 h-3 w-1/2 rounded bg-[#eaf6f6]" />
      </div>

      <div className="grid grid-cols-1 divide-y divide-[#b9dede] border-y border-[#b9dede] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex items-baseline justify-between gap-3 py-3 sm:px-5 sm:first:pl-0 sm:last:pr-0"
          >
            <div className="h-3 w-20 rounded bg-[#eaf6f6]" />
            <div className="h-5 w-10 rounded bg-[#b9dede]" />
          </div>
        ))}
      </div>

      <div>
        <div className="mb-2 h-3 w-24 rounded bg-[#eaf6f6]" />
        <div className="divide-y divide-[#b9dede] border-y border-[#b9dede]">
          {Array.from({ length: ledgerRows }, (_, i) => (
            <div key={i} className="h-12" />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 h-3 w-24 rounded bg-[#eaf6f6]" />
        <div className="divide-y divide-[#b9dede] border-y border-[#b9dede]">
          {Array.from({ length: listRows }, (_, i) => (
            <div key={i} className="h-12" />
          ))}
        </div>
      </div>

      <p className="text-sm text-[#356464]">Loading your workspace…</p>
    </div>
  );
}

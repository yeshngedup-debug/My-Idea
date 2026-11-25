/** Loading state for the founder's project list. No invented project data. */
export default function Loading() {
  return (
    <div
      className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12"
      role="status"
      aria-label="Loading your projects"
      aria-busy="true"
    >
      <div className="mx-auto max-w-5xl space-y-3 sm:space-y-4">
        <div className="h-8 w-56 max-w-full rounded-lg bg-[#eaf6f6]" />
        <div className="h-4 w-80 max-w-full rounded bg-[#eaf6f6]" />
        <div className="h-11 w-full max-w-md rounded-full bg-[#eaf6f6]" />
        <div className="h-24 w-full rounded-xl border border-[#b9dede] bg-[#ffffff]" />
        <p className="text-sm text-body-secondary">Loading your projects…</p>
      </div>
    </div>
  );
}

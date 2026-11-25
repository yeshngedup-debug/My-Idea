/** Loading state for a single project's detail and applicant list. */
export default function Loading() {
  return (
    <div
      className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12"
      role="status"
      aria-label="Loading project and applicants"
      aria-busy="true"
    >
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="h-8 w-64 max-w-full animate-pulse rounded-lg bg-[#eae5d9] motion-reduce:animate-none" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-[#eae5d9] motion-reduce:animate-none" />
        <div className="h-24 w-full animate-pulse rounded-xl border border-[#ded8cb] bg-[#fffefa] motion-reduce:animate-none" />
        <p className="text-sm text-[#56645c]">Loading project and applicants…</p>
      </div>
    </div>
  );
}

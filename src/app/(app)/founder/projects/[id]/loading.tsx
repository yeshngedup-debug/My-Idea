/** Loading state for a single project's detail and applicant list. */
export default function Loading() {
  return (
    <div
      className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12"
      role="status"
      aria-label="Loading project and applicants"
      aria-busy="true"
    >
      <div className="mx-auto max-w-5xl space-y-3 sm:space-y-4">
        <div className="h-8 w-64 max-w-full rounded-lg bg-[#eae5d9]" />
        <div className="h-4 w-72 max-w-full rounded bg-[#eae5d9]" />
        <div className="h-24 w-full rounded-xl border border-[#ded8cb] bg-[#fffefa]" />
        <p className="text-sm text-body-secondary">Loading project and applicants…</p>
      </div>
    </div>
  );
}

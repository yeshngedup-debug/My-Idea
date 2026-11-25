/**
 * Root loading fallback. Static blocks match the paper-and-ink palette; no
 * shimmer, so reduced-motion users get the same experience.
 */
export default function Loading() {
  return (
    <main
      id="main-content"
      role="status"
      aria-live="polite"
      className="flex min-h-svh items-center justify-center bg-[#eaf6f6] px-6 text-[#0b2e2e]"
    >
      <div className="w-full max-w-md space-y-4" aria-hidden="true">
        <div className="h-3 w-24 rounded bg-[#ded8cb]" />
        <div className="h-9 w-3/4 rounded bg-[#ded8cb]" />
        <div className="h-3 w-full rounded bg-[#eae5d9]" />
        <div className="h-3 w-2/3 rounded bg-[#eae5d9]" />
      </div>
      <span className="sr-only">Loading</span>
    </main>
  );
}

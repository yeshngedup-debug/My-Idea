/**
 * Root loading fallback. Static blocks match the marketplace layout and use no
 * shimmer or entrance animation.
 */
export default function Loading() {
  return (
    <main
      id="main-content"
      role="status"
      aria-live="polite"
      className="flex min-h-svh items-center bg-background px-5 py-16 text-foreground sm:px-8 sm:py-24"
    >
      <div className="w-full max-w-xl">
        <div className="h-3 w-24 rounded bg-muted" aria-hidden="true" />
        <div className="mt-4 h-10 w-4/5 rounded bg-muted" aria-hidden="true" />
        <div className="mt-5 h-3 w-full rounded bg-muted/70" aria-hidden="true" />
        <div className="mt-2 h-3 w-2/3 rounded bg-muted/70" aria-hidden="true" />
        <span className="sr-only">Loading</span>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const pathname = usePathname();
  const area = pathname?.match(/^\/(founder|student|admin)(?:\/|$)/)?.[1];
  const recoveryHref = area ? `/${area}` : "/";
  const recoveryLabel = area
    ? `Back to ${area} workspace`
    : "Back to home";

  return (
    <main
      id="main-content"
      className="flex min-h-svh flex-col bg-background px-5 py-16 text-foreground sm:px-8 sm:py-24"
    >
      <div className="m-auto w-full max-w-xl">
        <h1 className="text-balance text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-[1.08] tracking-tight">
          This page could not load
        </h1>
        <p className="mt-5 max-w-[52ch] text-base leading-7 text-muted-foreground">
          The request did not finish. Try the page again, or return to a known
          starting point.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={retry}
            className="inline-flex min-h-12 items-center rounded-lg bg-cta px-6 py-3 text-sm font-semibold text-cta-foreground transition-colors duration-150 hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
          >
            Try again
          </button>
          <Link
            href={recoveryHref}
            className="inline-flex min-h-12 items-center rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors duration-150 hover:border-border-strong hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
          >
            {recoveryLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}

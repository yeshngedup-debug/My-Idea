'use client';

/** Error boundary for the founder's project list. The failure is surfaced, not swallowed. */
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProjectsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error('Founder projects page failed', error);
  }, [error]);

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <div
        role="alert"
        className="mx-auto max-w-xl rounded-2xl border border-[#c2004b]/25 bg-[#ffffff] p-6 text-center sm:p-8"
      >
        <h1 className="text-xl font-semibold text-[#0b5c5c]">
          Could not load your projects
        </h1>
        <p className="mt-2 text-sm text-body-secondary">
          Your data is safe. Check your connection and try again.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={retry}
            className="pressable inline-flex min-h-11 items-center justify-center rounded-lg bg-[#ff0063] px-4 py-2 text-sm font-semibold text-[#000000] transition-colors hover:bg-[#d40054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]"
          >
            Try again
          </button>
          <Link
            href="/founder"
            className="pressable inline-flex min-h-11 items-center justify-center rounded-lg border border-[#b9dede] bg-[#ffffff] px-4 py-2 text-sm font-semibold text-[#0b5c5c] transition-colors hover:bg-[#eaf6f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]"
          >
            Back to overview
          </Link>
        </div>
      </div>
    </div>
  );
}

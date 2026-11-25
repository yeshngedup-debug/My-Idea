'use client';

/** Error boundary for a project's applicant list. Failures are surfaced, not swallowed. */
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProjectDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Founder project detail failed', error);
  }, [error]);

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <div
        role="alert"
        className="mx-auto max-w-xl rounded-2xl border border-[#c2004b]/25 bg-[#ffffff] p-6 text-center sm:p-8"
      >
        <h1 className="text-xl font-semibold text-[#0b5c5c]">
          Could not load this project
        </h1>
        <p className="mt-2 text-sm text-body-secondary">
          Check your connection and try again, or return to the projects list.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="pressable inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0b5c5c] px-4 py-2 text-sm font-semibold text-[#ffffff] transition-colors hover:bg-[#d40054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]"
          >
            Try again
          </button>
          <Link
            href="/founder/projects"
            className="pressable inline-flex min-h-11 items-center justify-center rounded-lg border border-[#b9dede] bg-[#ffffff] px-4 py-2 text-sm font-semibold text-[#0b5c5c] transition-colors hover:bg-[#eaf6f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]"
          >
            Back to projects
          </Link>
        </div>
      </div>
    </div>
  );
}

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
    <div className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div
        role="alert"
        className="mx-auto max-w-xl rounded-2xl border border-[#b23c26]/25 bg-[#fffefa] p-8 text-center"
      >
        <h1 className="text-xl font-semibold text-[#17352b]">
          We couldn&apos;t load this project
        </h1>
        <p className="mt-2 text-sm text-[#56645c]">
          The project or its applicant list is unavailable right now. Try again,
          or return to your projects.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="pressable inline-flex min-h-11 items-center justify-center rounded-lg bg-[#17352b] px-4 py-2 text-sm font-semibold text-[#fffefa] transition-colors hover:bg-[#244b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
          >
            Try again
          </button>
          <Link
            href="/founder/projects"
            className="pressable inline-flex min-h-11 items-center justify-center rounded-lg border border-[#ded8cb] bg-[#fffefa] px-4 py-2 text-sm font-semibold text-[#17352b] transition-colors hover:bg-[#f5f2ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
          >
            Back to my projects
          </Link>
        </div>
      </div>
    </div>
  );
}

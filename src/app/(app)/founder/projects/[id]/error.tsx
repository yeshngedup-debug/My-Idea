'use client';

/** Error boundary for a project's applicant list. Failures are surfaced, not swallowed. */
import { useEffect } from 'react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/empty-state';

export default function ProjectDetailError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error('Founder project detail failed', error);
  }, [error]);

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <ErrorState
        className="mx-auto max-w-xl"
        headingLevel="h1"
        title="Could not load this project"
        description="Check your connection and try again, or return to the projects list."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={retry}
              className="pressable inline-flex min-h-11 items-center justify-center rounded-lg bg-cta px-4 py-2 text-sm font-semibold text-cta-foreground transition-colors hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Try again
            </button>
            <Link
              href="/founder/projects"
              className="pressable inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Back to projects
            </Link>
          </div>
        }
      />
    </div>
  );
}

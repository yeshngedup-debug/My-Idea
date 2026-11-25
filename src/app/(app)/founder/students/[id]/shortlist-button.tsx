'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { requestShortlist } from '@/features/shortlist/actions';
import { colors } from '@/lib/design-tokens';

export function ShortlistButton({
  studentId,
  alreadyShortlisted,
  canRequest,
}: {
  studentId: string;
  alreadyShortlisted: boolean;
  canRequest: boolean;
}) {
  const router = useRouter();
  const [shortlisted, setShortlisted] = useState(alreadyShortlisted);
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!canRequest || shortlisted || pending) return;
    setFeedback(null);
    startTransition(async () => {
      try {
        const res = await requestShortlist(studentId);
        if (res.ok) {
          setShortlisted(true);
          setFeedback({ ok: true, message: 'Shortlist requested.' });
          router.refresh();
        } else {
          setFeedback({ ok: false, message: res.message });
        }
      } catch (error) {
        console.error('[student-detail] shortlist request failed', error);
        setFeedback({
          ok: false,
          message: 'Could not send the request. Please try again.',
        });
      }
    });
  }

  const label = shortlisted
    ? 'Shortlisted'
    : !canRequest
      ? 'Not eligible yet'
      : pending
        ? 'Sending...'
        : 'Request shortlist';

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        disabled={shortlisted || !canRequest || pending}
        aria-busy={pending}
        onClick={handleClick}
        className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-80 ${
          shortlisted || !canRequest
            ? 'cursor-default border border-primary/20 bg-primary/10 text-primary'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {label}
      </button>
      {shortlisted && (
        <p className="max-w-xs text-xs leading-5 text-body-secondary">
          Next:{' '}
          <Link
            href="/founder/shortlists"
            className="rounded font-semibold text-primary underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View Premium Shortlist
          </Link>
        </p>
      )}
      {!canRequest && !shortlisted && (
        <p className="max-w-xs text-xs leading-5 text-body-secondary">
          Available after an application to your project, or with a confirmed
          premium shortlist.{' '}
          <Link
            href="/founder/shortlists"
            className="rounded font-semibold text-primary underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View shortlists
          </Link>
        </p>
      )}
      {/* One stable live region for pending, success and error text. */}
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={
          feedback
            ? `text-xs leading-5 ${feedback.ok ? 'text-primary' : ''}`
            : 'sr-only'
        }
        style={
          feedback && !feedback.ok
            ? { color: colors.smallTextAccent }
            : undefined
        }
      >
        {feedback?.message ?? (pending ? 'Sending shortlist request...' : '')}
      </p>
    </div>
  );
}

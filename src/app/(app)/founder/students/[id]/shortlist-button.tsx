'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { requestShortlist } from '@/features/shortlist/actions';
import { StatusMessage } from '@/components/ui/status-message';

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
  const notice = feedback?.message ?? (pending ? 'Sending shortlist request...' : '');

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        disabled={shortlisted || !canRequest || pending}
        aria-busy={pending}
        onClick={handleClick}
        className={`pressable inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-80 ${
          shortlisted || !canRequest
            ? 'cursor-default border border-accent/20 bg-accent/10 text-accent'
            : 'bg-cta text-cta-foreground hover:bg-cta-hover'
        }`}
      >
        {label}
      </button>
      {shortlisted && (
        <p className="max-w-xs text-xs leading-5 text-body-secondary">
          Next:{' '}
          <Link
            href="/founder/shortlists"
            className="inline-block rounded py-0.5 font-semibold text-accent underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            className="inline-block rounded py-0.5 font-semibold text-accent underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View shortlists
          </Link>
        </p>
      )}
      {notice && (
        <StatusMessage
          key={notice}
          tone={
            feedback?.ok === false
              ? 'error'
              : feedback?.ok
                ? 'success'
                : 'info'
          }
          className="text-xs"
        >
          {notice}
        </StatusMessage>
      )}
    </div>
  );
}

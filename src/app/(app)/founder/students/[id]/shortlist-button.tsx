'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { requestShortlist } from '@/features/shortlist/actions';
import { colors } from '@/lib/design-tokens';

/** Mirrors the --ease-out token in app/globals.css. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Gentle entrance for the follow-up hint that appears after a request. */
function HintEntrance({
  children,
  className,
  skipInitial = false,
}: {
  children: ReactNode;
  className?: string;
  skipInitial?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <p className={className}>{children}</p>;
  return (
    <motion.p
      className={className}
      initial={skipInitial ? false : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.16, ease: EASE_OUT }}
    >
      {children}
    </motion.p>
  );
}

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
  // An already-shortlisted visitor sees this hint on load; only the hint that
  // follows a fresh request gets an entrance.
  const [skipInitial, setSkipInitial] = useState(true);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setSkipInitial(false));
    return () => cancelAnimationFrame(frame);
  }, []);

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
        className={`pressable inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-80 ${
          shortlisted || !canRequest
            ? 'cursor-default border border-primary/20 bg-primary/10 text-primary'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {label}
      </button>
      {shortlisted && (
        <HintEntrance
          className="max-w-xs text-xs leading-5 text-body-secondary"
          skipInitial={skipInitial}
        >
          Next:{' '}
          <Link
            href="/founder/shortlists"
            className="rounded font-semibold text-primary underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View Premium Shortlist
          </Link>
        </HintEntrance>
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

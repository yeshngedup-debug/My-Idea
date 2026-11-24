'use client';

import { useState, useTransition } from 'react';
import { requestShortlist } from '@/app/actions/shortlist';

export function ShortlistButton({
  studentId,
  alreadyShortlisted,
}: {
  studentId: string;
  alreadyShortlisted: boolean;
}) {
  const [shortlisted, setShortlisted] = useState(alreadyShortlisted);
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={shortlisted || pending}
        onClick={() =>
          startTransition(async () => {
            const res = await requestShortlist(studentId);
            setFeedback({ ok: res.ok, message: res.message });
            if (res.ok) setShortlisted(true);
          })
        }
        className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] disabled:opacity-80 ${
          shortlisted
            ? 'cursor-default border border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]'
            : 'bg-[#17352b] text-[#fffefa] hover:bg-[#244b3e]'
        }`}
      >
        {shortlisted ? (
          <>Shortlisted</>
        ) : (
          <>{pending ? 'Sending...' : 'Request shortlist'}</>
        )}
      </button>
      {feedback && (
        <p
          role={feedback.ok ? 'status' : 'alert'}
          className={`mt-2 text-xs leading-5 ${
            feedback.ok ? 'text-[#17352b]' : 'text-[#b23c26]'
          }`}
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
}

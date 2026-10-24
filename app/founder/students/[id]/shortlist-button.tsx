'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Star } from 'lucide-react';
import { requestShortlist } from '@/app/actions/shortlist';

export function ShortlistButton({
  studentId,
  alreadyShortlisted,
}: {
  studentId: string;
  alreadyShortlisted: boolean;
}) {
  const [shortlisted, setShortlisted] = useState(alreadyShortlisted);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={shortlisted || pending}
      onClick={() =>
        startTransition(async () => {
          const res = await requestShortlist(studentId);
          if (res.ok) setShortlisted(true);
        })
      }
      className={`inline-flex justify-center items-center gap-1.5 rounded-xl px-5 py-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
        shortlisted
          ? 'bg-emerald-400/10 text-emerald-300 cursor-default'
          : 'bg-amber-400 text-black hover:bg-amber-300'
      } disabled:opacity-80`}
    >
      {shortlisted ? (
        <>
          <CheckCircle2 className="w-4 h-4" /> Shortlisted
        </>
      ) : (
        <>
          <Star className="w-4 h-4" />
          {pending ? 'Sending...' : 'Request shortlist'}
        </>
      )}
    </button>
  );
}

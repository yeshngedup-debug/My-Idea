'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { requestShortlist } from '@/features/shortlist/actions';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { StatusMessage } from '@/components/ui/status-message';
import { SegmentedControl } from '@/components/interactive/segmented-control';

export interface StudentCard {
  id: string;
  full_name: string | null;
  college: string | null;
  course: string | null;
  year: string | null;
  skills: string[] | null;
  bio: string | null;
  availability: string | null;
  /** Computed on the server from the same gate the shortlist action enforces. */
  canRequestShortlist: boolean;
}

const AVAILABILITY_FILTERS = [
  { value: '', label: 'All' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'evenings', label: 'Evenings' },
  { value: 'full_time', label: 'Full time' },
  { value: 'flexible', label: 'Flexible' },
];

const AVAILABILITY_LABEL: Record<string, string> = {
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  evenings: 'Evenings',
  full_time: 'Full time',
  flexible: 'Flexible',
};

export function BrowseClient({
  students,
  shortlistedIds,
}: {
  students: StudentCard[];
  shortlistedIds: string[];
}) {
  const [query, setQuery] = useState('');
  const [availability, setAvailability] = useState('');
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set(shortlistedIds));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ id: string; ok: boolean; msg: string } | null>(
    null
  );
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      if (availability && s.availability !== availability) return false;
      if (!q) return true;
      const skillMatch = (s.skills ?? []).some((k) => k.toLowerCase().includes(q));
      const collegeMatch = (s.college ?? '').toLowerCase().includes(q);
      const nameMatch = (s.full_name ?? '').toLowerCase().includes(q);
      return skillMatch || collegeMatch || nameMatch;
    });
  }, [students, query, availability]);

  function handleShortlist(id: string) {
    setPendingId(id);
    setStatus(null);
    startTransition(async () => {
      try {
        const res = await requestShortlist(id);
        if (res.ok) {
          setShortlisted((prev) => new Set(prev).add(id));
        }
        setStatus({ id, ok: res.ok, msg: res.message });
      } catch (error) {
        // A rejected/thrown action must never leave the card stuck on
        // "Sending..." or fail silently.
        console.error('[browse-students] shortlist request failed', error);
        setStatus({
          id,
          ok: false,
          msg: 'Could not send the request. Please try again.',
        });
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#356464]"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills, college, or name..."
          aria-label="Search students by skills, college, or name"
          className="w-full pl-10 motion-reduce:transition-none"
        />
      </div>

      <SegmentedControl
        options={AVAILABILITY_FILTERS}
        value={availability}
        onChange={setAvailability}
        ariaLabel="Availability"
        className="max-w-full"
      />

      <h2 className="sr-only">Student profiles</h2>
      <p className="text-xs tabular-nums text-[#356464]">
        {filtered.length} {filtered.length === 1 ? 'student' : 'students'}
        {availability ? ` available ${AVAILABILITY_LABEL[availability]?.toLowerCase() ?? availability}` : ''}
      </p>

      {status && (
        <StatusMessage
          key={status.id}
          tone={status.ok ? 'success' : 'error'}
        >
          {status.msg}
        </StatusMessage>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title={students.length === 0 ? 'No students yet' : 'No students match'}
          description={
            students.length === 0
              ? 'Students are still signing up and completing their profiles. Check back soon.'
              : 'Try a different skill, college, or availability filter.'
          }
          action={
            students.length === 0 ? undefined : (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setAvailability('');
                }}
                className="pressable inline-flex min-h-11 items-center rounded-full bg-[#0b5c5c] px-6 py-3 text-sm font-semibold text-[#ffffff] hover:bg-[#c2004b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2"
              >
                Clear filters
              </button>
            )
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((s) => {
            const isShortlisted = shortlisted.has(s.id);
            const isPending = pendingId === s.id;
            const studentName = s.full_name ?? 'student';
            return (
              <li key={s.id} className="group flex flex-col rounded-2xl border border-[#b9dede] bg-[#ffffff] p-5 transition-colors duration-150 motion-reduce:transition-none hover:border-[#66bfbf]/25 hover:bg-[#eaf6f6]">
                <div className="mb-1 flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold leading-snug text-[#0b5c5c]">
                    {s.full_name}
                  </h3>
                  {s.availability && (
                    <Badge variant="outline" className="shrink-0 text-[#0b5c5c]">
                      {AVAILABILITY_LABEL[s.availability] ?? s.availability}
                    </Badge>
                  )}
                </div>

                <p className="mb-3 inline-flex items-center gap-1.5 text-sm text-[#356464]">
                  {s.college}
                  {s.course ? ` - ${s.course}` : ''}
                  {s.year ? ` (${s.year} year)` : ''}
                </p>

                {(s.skills?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(s.skills ?? []).slice(0, 4).map((k) => (
                      <Badge key={k} variant="outline" className="border-[#b9dede] bg-[#eaf6f6] text-[#356464]">{k}</Badge>
                    ))}
                    {(s.skills ?? []).length > 4 && (
                      <Badge variant="outline" className="border-[#b9dede] bg-[#eaf6f6] text-[#356464]">
                        +{(s.skills ?? []).length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                {s.bio && (
                  <p className="mb-4 line-clamp-2 text-sm text-[#356464]">{s.bio}</p>
                )}

                <div className="mt-auto flex flex-col sm:flex-row gap-2">
                  <Link href={`/founder/students/${s.id}`} className="pressable inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[#b9dede] bg-[#ffffff] px-4 py-2.5 text-sm font-semibold text-[#0b5c5c] transition-colors motion-reduce:transition-none hover:bg-[#eaf6f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]">
                    View full profile
                  </Link>
                  {s.canRequestShortlist ? (
                    <button
                      type="button"
                      disabled={isShortlisted || isPending}
                      aria-busy={isPending || undefined}
                      onClick={() => handleShortlist(s.id)}
                      aria-label={
                        isShortlisted
                          ? `Shortlisted: ${studentName}`
                          : isPending
                            ? `Sending shortlist request for ${studentName}`
                            : `Request shortlist for ${studentName}`
                      }
                      className={`pressable inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] ${
                        isShortlisted
                          ? 'cursor-default border border-[#66bfbf]/20 bg-[#0b5c5c]/8 text-[#0b5c5c]'
                          : 'bg-[#ff0063] text-[#000000] hover:bg-[#d40054]'
                      } disabled:opacity-80`}
                    >
                      {isShortlisted ? (
                        'Shortlisted'
                      ) : (
                        <>
                          {isPending ? 'Sending...' : 'Request shortlist'}
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href="/founder/shortlists"
                      aria-label={`View shortlist options for ${studentName}`}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[#b9dede] bg-[#ffffff] px-4 py-2.5 text-sm font-semibold text-[#0b5c5c] transition-colors motion-reduce:transition-none hover:bg-[#eaf6f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]"
                    >
                      View shortlist options
                    </Link>
                  )}
                </div>
                {status?.id === s.id && (
                  <p
                    className={`mt-2 text-xs ${status.ok ? 'text-[#0b5c5c]' : 'text-[#c2004b]'}`}
                  >
                    {status.msg}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

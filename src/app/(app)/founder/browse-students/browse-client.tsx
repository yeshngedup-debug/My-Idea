'use client';

/**
 * Founder's student directory.
 *
 * A dense ledger, not a card wall: each student is one row with the facts a
 * founder needs to decide (skills, college, availability) and two real
 * actions — open the full profile, or request a shortlist. The request gate
 * (`canRequestShortlist`) is computed on the server and mirrored here; the
 * client never invents eligibility.
 *
 * One magenta action belongs to the view ("Get Shortlist", which unlocks the
 * request flow). The per-row request button is teal so it never competes.
 */
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

const ROW_LINK =
  'inline-flex min-h-11 items-center rounded text-sm font-semibold text-[#0b5c5c] underline decoration-[#b9dede] underline-offset-4 transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:text-[#c2004b] hover:decoration-[#c2004b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]';

const REQUEST_BUTTON =
  'pressable inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md bg-[#0b5c5c] px-4 py-2.5 text-sm font-semibold text-[#ffffff] transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-[#0b2e2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] disabled:cursor-not-allowed disabled:opacity-80';

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

      {/* The one magenta action in this view. */}
      <Link
        href="/founder/shortlists"
        className="pressable inline-flex min-h-11 items-center justify-center rounded-md bg-[#ff0063] px-5 py-2.5 text-sm font-semibold text-[#000000] transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-[#d40054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]"
      >
        Get Shortlist
      </Link>

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
                className="pressable inline-flex min-h-11 items-center rounded-md border border-[#b9dede] bg-[#ffffff] px-5 py-2.5 text-sm font-semibold text-[#0b5c5c] transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-[#eaf6f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]"
              >
                Clear filters
              </button>
            )
          }
        />
      ) : (
        <ul className="divide-y divide-[#b9dede] border-y border-[#b9dede]">
          {filtered.map((s) => {
            const isShortlisted = shortlisted.has(s.id);
            const isPending = pendingId === s.id;
            const studentName = s.full_name ?? 'student';
            const skills = s.skills ?? [];
            return (
              <li key={s.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="min-w-0 break-words text-base font-semibold leading-snug text-[#0b5c5c]">
                        {s.full_name}
                      </h3>
                      {s.availability && (
                        <Badge variant="outline" className="shrink-0 text-[#0b5c5c]">
                          {AVAILABILITY_LABEL[s.availability] ?? s.availability}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-[#356464]">
                      {s.college}
                      {s.course ? ` - ${s.course}` : ''}
                      {s.year ? ` (${s.year} year)` : ''}
                    </p>
                    {s.bio && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-[#356464]">{s.bio}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Link href={`/founder/students/${s.id}`} className={ROW_LINK}>
                      View full profile
                      <span className="sr-only"> for {studentName}</span>
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
                        className={REQUEST_BUTTON}
                      >
                        {isShortlisted
                          ? 'Shortlisted'
                          : isPending
                            ? 'Sending...'
                            : 'Request shortlist'}
                      </button>
                    ) : (
                      <Link
                        href="/founder/shortlists"
                        aria-label={`View shortlist options for ${studentName}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#b9dede] bg-[#ffffff] px-4 py-2.5 text-sm font-semibold text-[#0b5c5c] transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-[#eaf6f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]"
                      >
                        Shortlist options
                      </Link>
                    )}
                  </div>
                </div>

                {skills.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {skills.slice(0, 6).map((k) => (
                      <li key={k}>
                        <Badge variant="outline" className="border-[#b9dede] bg-[#eaf6f6] text-[#356464]">
                          {k}
                        </Badge>
                      </li>
                    ))}
                    {skills.length > 6 && (
                      <li>
                        <Badge variant="outline" className="border-[#b9dede] bg-[#eaf6f6] text-[#356464]">
                          +{skills.length - 6} more
                        </Badge>
                      </li>
                    )}
                  </ul>
                )}

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

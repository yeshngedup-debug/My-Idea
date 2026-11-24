'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { requestShortlist } from '@/app/actions/shortlist';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export interface StudentCard {
  id: string;
  full_name: string | null;
  college: string | null;
  course: string | null;
  year: string | null;
  skills: string[] | null;
  bio: string | null;
  availability: string | null;
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
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
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
    startTransition(async () => {
      const res = await requestShortlist(id);
      if (res.ok) {
        setShortlisted((prev) => new Set(prev).add(id));
      }
      setStatus({ ok: res.ok, msg: res.message });
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills, college, or name..."
          aria-label="Search students by skills, college, or name"
          className="w-full pl-10"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {AVAILABILITY_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setAvailability(f.value)}
            aria-pressed={availability === f.value}
            className={`min-h-9 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] ${
              availability === f.value
                ? 'bg-[#17352b] text-[#fffefa]'
                : 'border border-[#ded8cb] bg-[#fffefa] text-[#4c5a52] hover:bg-[#f5f2ea]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-[#657069]" role="status">
        {filtered.length} {filtered.length === 1 ? 'student' : 'students'}
        {availability ? ` available ${AVAILABILITY_LABEL[availability]?.toLowerCase() ?? availability}` : ''}
      </p>

      {status && (
        <p role="status" className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
          status.ok
            ? 'border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]'
            : 'border-[#b23c26]/25 bg-[#b23c26]/8 text-[#b23c26]'
        }`}>
          {status.ok ? <span className="w-4 h-4 shrink-0" /> : <span className="w-4 h-4 shrink-0" />}
          {status.msg}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ded8cb] bg-[#fffefa] p-10 text-center">
          <h3 className="mb-2 text-lg font-semibold text-[#17352b]">
            {students.length === 0 ? 'No students yet' : 'No students match'}
          </h3>
          <p className="text-sm text-[#657069]">
            {students.length === 0
              ? 'Students are still signing up and completing their profiles. Check back soon.'
              : 'Try a different skill, college, or availability filter.'}
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((s) => {
            const isShortlisted = shortlisted.has(s.id);
            return (
              <li key={s.id} className="group flex flex-col rounded-2xl border border-[#ded8cb] bg-[#fffefa] p-5 transition-colors duration-150 hover:border-[#17352b]/25 hover:bg-[#f5f2ea]">
                <div className="mb-1 flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold leading-snug text-[#17352b]">
                    {s.full_name}
                  </h3>
                  {s.availability && (
                    <Badge className="shrink-0 border-amber-200 bg-amber-50 text-[#8a5a00]">
                      {AVAILABILITY_LABEL[s.availability] ?? s.availability}
                    </Badge>
                  )}
                </div>

                <p className="mb-3 inline-flex items-center gap-1.5 text-sm text-[#4c5a52]">
                  {s.college}
                  {s.course ? ` - ${s.course}` : ''}
                  {s.year ? ` (${s.year} year)` : ''}
                </p>

                {(s.skills?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(s.skills ?? []).slice(0, 4).map((k) => (
                      <Badge key={k} variant="outline" className="border-[#ded8cb] bg-[#f5f2ea] text-[#4c5a52]">{k}</Badge>
                    ))}
                    {(s.skills ?? []).length > 4 && (
                      <Badge variant="outline" className="border-[#ded8cb] bg-[#f5f2ea] text-[#657069]">
                        +{(s.skills ?? []).length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                {s.bio && (
                  <p className="mb-4 line-clamp-2 text-sm text-[#4c5a52]">{s.bio}</p>
                )}

                <div className="mt-auto flex flex-col sm:flex-row gap-2">
                  <Link href={`/founder/students/${s.id}`} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-2.5 text-sm font-semibold text-[#17352b] transition-colors hover:bg-[#f5f2ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]">
                    View full profile
                  </Link>
                  <button
                    type="button"
                    disabled={isShortlisted || pendingId === s.id}
                    onClick={() => handleShortlist(s.id)}
                    className={`inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] ${
                      isShortlisted
                        ? 'cursor-default border border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]'
                        : 'bg-[#17352b] text-[#fffefa] hover:bg-[#244b3e]'
                    } disabled:opacity-80`}
                  >
                    {isShortlisted ? (
                      <>
                        Shortlisted
                      </>
                    ) : (
                      <>
                        {pendingId === s.id ? 'Sending...' : 'Request shortlist'}
                      </>
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

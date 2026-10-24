'use client';

/**
 * Browse Students client — search (skills/college/name), availability filter,
 * clean mobile-first cards with View Full Profile + Request Shortlist.
 */
import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { Search, GraduationCap, CheckCircle2, XCircle, Star } from 'lucide-react';
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
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills, college, or name..."
          aria-label="Search students by skills, college, or name"
          className="pl-11"
        />
      </div>

      {/* Availability filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {AVAILABILITY_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setAvailability(f.value)}
            aria-pressed={availability === f.value}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              availability === f.value
                ? 'bg-amber-400 text-black'
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-white/40" role="status">
        {filtered.length} {filtered.length === 1 ? 'student' : 'students'}
        {availability ? ` available ${AVAILABILITY_LABEL[availability]?.toLowerCase() ?? availability}` : ''}
      </p>

      {/* Shortlist request result */}
      {status && (
        <p
          role="status"
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border ${
            status.ok
              ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300'
              : 'bg-red-400/10 border-red-400/30 text-red-300'
          }`}
        >
          {status.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          {status.msg}
        </p>
      )}

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-10 text-center">
          <h3 className="text-xl font-extrabold tracking-tight mb-2">
            {students.length === 0 ? 'No students yet' : 'No students match'}
          </h3>
          <p className="text-white/50 text-sm">
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
              <li
                key={s.id}
                className="bg-white/[0.04] border border-white/10 rounded-3xl p-5 flex flex-col hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="text-lg font-extrabold tracking-tight leading-snug">
                    {s.full_name}
                  </h3>
                  {s.availability && (
                    <Badge className="shrink-0 bg-amber-400/10 text-amber-300">
                      {AVAILABILITY_LABEL[s.availability] ?? s.availability}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-white/50 mb-3 inline-flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 shrink-0 text-white/30" />
                  {s.college}
                  {s.course ? ` - ${s.course}` : ''}
                  {s.year ? ` (${s.year} year)` : ''}
                </p>

                {(s.skills?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {s.skills!.slice(0, 4).map((k) => (
                      <Badge key={k} variant="outline" className="text-white/60">
                        {k}
                      </Badge>
                    ))}
                    {s.skills!.length > 4 && (
                      <Badge variant="outline" className="text-white/40">
                        +{s.skills!.length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                {s.bio && (
                  <p className="text-sm text-white/50 line-clamp-2 mb-4">{s.bio}</p>
                )}

                <div className="mt-auto flex flex-col sm:flex-row gap-2">
                  <Link
                    href={`/founder/students/${s.id}`}
                    className="flex-1 inline-flex justify-center items-center rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    View full profile
                  </Link>
                  <button
                    type="button"
                    disabled={isShortlisted || pendingId === s.id}
                    onClick={() => handleShortlist(s.id)}
                    className={`flex-1 inline-flex justify-center items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                      isShortlisted
                        ? 'bg-emerald-400/10 text-emerald-300 cursor-default'
                        : 'bg-amber-400 text-black hover:bg-amber-300'
                    } disabled:opacity-80`}
                  >
                    {isShortlisted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Shortlisted
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4" />
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

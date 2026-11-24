'use client';

/**
 * Admin students management UI — search, manual rank, verify toggle,
 * multi-select, shortlist generation with copy + download.
 * Mobile-first: cards with 44px+ touch targets, sticky action bar.
 */
import { useMemo, useState, useTransition } from 'react';
import {
  MagnifyingGlass,
  SealCheck,
  Bag,
  Star,
  CheckSquare,
  Square,
  Download,
  FileText,
  CheckCircle,
  Warning,
} from '@phosphor-icons/react';
import {
  setStudentRank,
  setStudentVerified,
  generateShortlist,
} from '@/app/actions/admin-students';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/interactive/copy-button';

export interface AdminStudent {
  id: string;
  full_name: string | null;
  college: string | null;
  course: string | null;
  year: string | null;
  skills: string[] | null;
  bio: string | null;
  availability: string | null;
  cv_path: string | null;
  rank: number | null;
  verified: boolean;
  contact_email: string | null;
  applications?: number;
}

interface Props {
  students: AdminStudent[];
  founders: { id: string; full_name: string | null }[];
  projects: { id: string; title: string; founder_id: string }[];
}

type VerifiedFilter = '' | 'verified' | 'not_verified' | 'applied';

const AVAILABILITY_LABEL: Record<string, string> = {
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  evenings: 'Evenings',
  full_time: 'Full time',
  flexible: 'Flexible',
};

export function AdminStudentsClient({ students, founders, projects }: Props) {
  const [query, setQuery] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<VerifiedFilter>('');
  const [ranks, setRanks] = useState<Record<string, string>>(
    Object.fromEntries(students.map((s) => [s.id, s.rank != null ? String(s.rank) : '']))
  );
  const [verified, setVerified] = useState<Record<string, boolean>>(
    Object.fromEntries(students.map((s) => [s.id, s.verified]))
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [founderId, setFounderId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [shortlistText, setShortlistText] = useState<string | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [generating, startGenerate] = useTransition();
  const [, startRank] = useTransition();
  const [, startVerify] = useTransition();

  const founderProjects = useMemo(
    () => projects.filter((p) => !founderId || p.founder_id === founderId),
    [projects, founderId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students
      .filter((s) => {
        if (verifiedFilter === 'verified' && !verified[s.id]) return false;
        if (verifiedFilter === 'not_verified' && verified[s.id]) return false;
        if (verifiedFilter === 'applied' && (s.applications ?? 0) === 0) return false;
        if (!q) return true;
        return (
          (s.full_name ?? '').toLowerCase().includes(q) ||
          (s.college ?? '').toLowerCase().includes(q) ||
          (s.skills ?? []).some((k) => k.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        const ra = ranks[a.id] ? Number(ranks[a.id]) : 9999;
        const rb = ranks[b.id] ? Number(ranks[b.id]) : 9999;
        return ra - rb;
      });
  }, [students, query, verifiedFilter, verified, ranks]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        filtered.forEach((s) => next.delete(s.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((s) => next.add(s.id));
      return next;
    });
  }

  function saveRank(id: string) {
    const raw = ranks[id]?.trim() ?? '';
    const next = raw === '' ? null : Number(raw);
    startRank(async () => {
      const res = await setStudentRank(id, next);
      if (!res.ok) setStatus({ ok: false, msg: res.message });
      else setStatus({ ok: true, msg: `Rank ${next ?? 'cleared'} saved.` });
    });
  }

  function toggleVerified(student: AdminStudent) {
    const id = student.id;
    const next = !verified[id];
    setVerified((prev) => ({ ...prev, [id]: next })); // optimistic
    startVerify(async () => {
      const res = await setStudentVerified(id, next);
      if (!res.ok) {
        setVerified((prev) => ({ ...prev, [id]: !next })); // revert
        setStatus({ ok: false, msg: res.message });
      } else {
        setStatus({
          ok: true,
          msg: `Verification saved for ${student.full_name ?? 'student'}.`,
        });
      }
    });
  }

  function handleGenerate() {
    const ids = Array.from(selected);
    startGenerate(async () => {
      const res = await generateShortlist(ids, founderId, projectId || null);
      if (res.ok && res.text) {
        setShortlistText(res.text);
        setStatus({ ok: true, msg: res.message });
      } else {
        setStatus({ ok: false, msg: res.message });
      }
    });
  }

  function downloadShortlist() {
    if (!shortlistText) return;
    const blob = new Blob([shortlistText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shortlist-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 pb-28">
      {/* Search + filters */}
      <div className="relative">
        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#17352b]/30 pointer-events-none" aria-hidden="true" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, college, skill..."
          aria-label="Search students"
          className="pl-11"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {(
          [
            { value: '', label: 'All' },
            { value: 'verified', label: 'Verified' },
            { value: 'not_verified', label: 'Not verified' },
            { value: 'applied', label: 'Applied' },
          ] as { value: VerifiedFilter; label: string }[]
        ).map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setVerifiedFilter(f.value)}
            aria-pressed={verifiedFilter === f.value}
            className={`min-h-9 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] ${
              verifiedFilter === f.value
                ? 'bg-amber-300 text-[#17352b]'
                : 'bg-[#f5f2ea] border border-[#ded8cb] text-[#4c5a52] hover:bg-[#17352b]/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Status banner */}
      {status && (
        <p
          role="status"
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border ${
            status.ok
              ? 'border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]'
              : 'border-[#b23c26]/25 bg-[#b23c26]/8 text-[#b23c26]'
          }`}
        >
          {status.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <Warning className="w-4 h-4 shrink-0" />}
          {status.msg}
        </p>
      )}

      {/* Select all */}
      {filtered.length > 0 && (
        <button
          type="button"
          onClick={toggleSelectAll}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg px-1 text-sm text-[#4c5a52] transition-colors hover:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
        >
          {allVisibleSelected ? (
            <CheckSquare className="w-4 h-4 text-[#8a5a00]" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          {allVisibleSelected ? 'Deselect all' : 'Select all shown'}
        </button>
      )}

      {/* Student cards */}
      {filtered.length === 0 ? (
        <div className="bg-[#fffefa] border border-[#ded8cb] rounded-2xl p-10 text-center">
          <h3 className="mb-2 text-lg font-semibold text-[#17352b]">
            {students.length === 0 ? 'No students yet' : 'No students match'}
          </h3>
          <p className="text-[#657069] text-sm">
            {students.length === 0
              ? 'Students appear here once they sign up and save a profile.'
              : 'Adjust the search or filters.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((s) => {
            const isSelected = selected.has(s.id);
            const isVerified = verified[s.id];
            return (
              <li
                key={s.id}
                className={`bg-[#fffefa] border rounded-2xl p-4 transition-colors ${
                  isSelected ? 'border-[#d84f37]/40 bg-[#d84f37]/8' : 'border-[#ded8cb]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Select */}
                  <button
                    type="button"
                    onClick={() => toggleSelect(s.id)}
                    aria-label={isSelected ? `Deselect ${s.full_name}` : `Select ${s.full_name}`}
                    aria-pressed={isSelected}
                    className="mt-1 grid min-h-8 min-w-8 shrink-0 place-items-center rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-[#8a5a00]" aria-hidden="true" />
                    ) : (
                      <Square className="w-5 h-5 text-[#657069]" aria-hidden="true" />
                    )}
                  </button>

                  {/* Rank */}
                  <div className="shrink-0">
                    <label htmlFor={`rank-${s.id}`} className="block text-[10px] uppercase tracking-wide text-[#657069] mb-1 text-center">
                      Rank
                    </label>
                    <input
                      id={`rank-${s.id}`}
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={ranks[s.id] ?? ''}
                      onChange={(e) => setRanks((prev) => ({ ...prev, [s.id]: e.target.value }))}
                      onBlur={() => saveRank(s.id)}
                      onKeyDown={(e) => e.key === 'Enter' && saveRank(s.id)}
                      placeholder="-"
                      className="w-14 h-11 rounded-xl bg-[#f5f2ea] border border-[#ded8cb] text-center text-[#17352b] text-base focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 [color-scheme:light]"
                    />
                  </div>

                  {/* Identity */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="truncate text-base font-semibold text-[#17352b]">
                        {s.full_name}
                      </h3>
                      {isVerified ? (
                        <SealCheck className="w-4 h-4 text-[#17352b] shrink-0" aria-hidden="true" aria-label="Verified" />
                      ) : (
                        <Bag className="w-4 h-4 text-[#17352b]/30 shrink-0" aria-hidden="true" aria-label="Not verified" />
                      )}
                    </div>
                    <p className="text-xs text-[#657069] truncate">
                      {s.college}
                      {s.course ? ` - ${s.course}` : ''}
                      {s.year ? ` (${s.year})` : ''}
                    </p>
                    {(s.skills?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(s.skills ?? []).slice(0, 4).map((k) => (
                          <Badge key={k} variant="outline" className="border-[#ded8cb] bg-[#f5f2ea] text-[10px] text-[#4c5a52]">
                            {k}
                          </Badge>
                        ))}
                        {(s.skills ?? []).length > 4 && (
                          <Badge variant="outline" className="border-[#ded8cb] bg-[#f5f2ea] text-[10px] text-[#657069]">
                            +{(s.skills ?? []).length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-[#657069]">
                      {s.availability && <span>{AVAILABILITY_LABEL[s.availability] ?? s.availability}</span>}
                      <span>
                        {(s.applications ?? 0) > 0
                          ? `${s.applications} ${(s.applications ?? 0) === 1 ? 'application' : 'applications'}`
                          : 'No applications yet'}
                      </span>
                      {s.cv_path && (
                        <span className="inline-flex items-center gap-1">
                          <FileText className="w-3 h-3" aria-hidden="true" /> CV on file
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verify toggle */}
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => toggleVerified(s)}
                    className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] ${
                      isVerified
                        ? 'border border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b] hover:bg-[#17352b]/12'
                        : 'bg-[#f5f2ea] border border-[#ded8cb] text-[#4c5a52] hover:bg-[#17352b]/10'
                    }`}
                  >
                    {isVerified ? (
                      <>
                        <SealCheck className="w-3.5 h-3.5" aria-hidden="true" /> Verified
                      </>
                    ) : (
                      <>
                        <Bag className="w-3.5 h-3.5" aria-hidden="true" /> Not verified
                      </>
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Shortlist generation result */}
      {shortlistText && (
        <div className="bg-[#fffefa] border border-[#d84f37]/25 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#8a5a00]">Generated shortlist</h3>
          <textarea
            readOnly
            value={shortlistText}
            rows={12}
            className="w-full rounded-xl bg-[#f5f2ea] border border-[#ded8cb] p-4 text-xs text-[#17352b] font-mono focus:outline-none"
            aria-label="Generated shortlist text"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <CopyButton
                text={shortlistText}
                label="Copy"
                className="w-full rounded-xl border-amber-300 bg-amber-300 font-bold text-[#17352b] hover:bg-amber-200"
              />
            </div>
            <Button
              type="button"
              onClick={downloadShortlist}
              variant="outline"
              className="flex-1 border-[#ded8cb] bg-transparent text-[#17352b] hover:bg-[#17352b]/10 h-11"
            >
              <Download className="w-4 h-4 mr-1" aria-hidden="true" /> Download .txt
            </Button>
          </div>
        </div>
      )}

      {/* Sticky action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-[#fffefa]/95 backdrop-blur-md border-t border-[#ded8cb] px-4 py-3">
          <div className="max-w-2xl mx-auto space-y-2">
            <p className="text-xs text-[#657069] text-center sm:text-left">
              {selected.size} {selected.size === 1 ? 'student' : 'students'} selected
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={founderId}
                onChange={(e) => {
                  setFounderId(e.target.value);
                  setProjectId('');
                }}
                aria-label="Choose founder"
                className="flex-1 rounded-xl border border-[#ded8cb] bg-[#f5f2ea] px-3 py-2.5 text-sm text-[#17352b] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 [&>option]:bg-[#fffefa]"
              >
                <option value="">Choose founder...</option>
                {founders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.full_name || 'Unnamed founder'}
                  </option>
                ))}
              </select>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                aria-label="Choose project"
                disabled={!founderId}
                className="flex-1 rounded-xl border border-[#ded8cb] bg-[#f5f2ea] px-3 py-2.5 text-sm text-[#17352b] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 disabled:opacity-40 [&>option]:bg-[#fffefa]"
              >
                <option value="">No specific project</option>
                {founderProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !founderId}
                className="pressable bg-amber-300 text-[#17352b] font-bold hover:bg-amber-200 h-11 shrink-0"
              >
                <Star className="w-4 h-4 mr-1" aria-hidden="true" />
                {generating ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

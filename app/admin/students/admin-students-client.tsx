'use client';

/**
 * Admin students management UI — search, manual rank, verify toggle,
 * multi-select, shortlist generation with copy + download.
 * Mobile-first: cards with 44px+ touch targets, sticky action bar.
 */
import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Search,
  BadgeCheck,
  BadgeX,
  Star,
  CheckSquare,
  Square,
  Copy,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  setStudentRank,
  setStudentVerified,
  generateShortlist,
} from '@/app/actions/admin-students';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  const [copied, setCopied] = useState(false);
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

  function toggleVerified(id: string) {
    const next = !verified[id];
    setVerified((prev) => ({ ...prev, [id]: next })); // optimistic
    startVerify(async () => {
      const res = await setStudentVerified(id, next);
      if (!res.ok) {
        setVerified((prev) => ({ ...prev, [id]: !next })); // revert
        setStatus({ ok: false, msg: res.message });
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

  async function copyShortlist() {
    if (!shortlistText) return;
    try {
      await navigator.clipboard.writeText(shortlistText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatus({ ok: false, msg: 'Copy failed — select the text manually.' });
    }
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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
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
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              verifiedFilter === f.value
                ? 'bg-amber-400 text-black'
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
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
              ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300'
              : 'bg-red-400/10 border-red-400/30 text-red-300'
          }`}
        >
          {status.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {status.msg}
        </p>
      )}

      {/* Select all */}
      {filtered.length > 0 && (
        <button
          type="button"
          onClick={toggleSelectAll}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg px-1"
        >
          {allVisibleSelected ? (
            <CheckSquare className="w-4 h-4 text-amber-400" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          {allVisibleSelected ? 'Deselect all' : 'Select all shown'}
        </button>
      )}

      {/* Student cards */}
      {filtered.length === 0 ? (
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-10 text-center">
          <h3 className="text-xl font-extrabold tracking-tight mb-2">
            {students.length === 0 ? 'No students yet' : 'No students match'}
          </h3>
          <p className="text-white/50 text-sm">
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
                className={`bg-white/[0.04] border rounded-3xl p-4 transition-colors ${
                  isSelected ? 'border-amber-400/50 bg-amber-400/[0.06]' : 'border-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Select */}
                  <button
                    type="button"
                    onClick={() => toggleSelect(s.id)}
                    aria-label={isSelected ? `Deselect ${s.full_name}` : `Select ${s.full_name}`}
                    aria-pressed={isSelected}
                    className="mt-1 shrink-0 p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Square className="w-5 h-5 text-white/40" />
                    )}
                  </button>

                  {/* Rank */}
                  <div className="shrink-0">
                    <label htmlFor={`rank-${s.id}`} className="block text-[10px] uppercase tracking-wide text-white/40 mb-1 text-center">
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
                      className="w-14 h-11 rounded-xl bg-white/5 border border-white/10 text-center text-white text-base focus:outline-none focus:ring-2 focus:ring-amber-400/40 [color-scheme:dark]"
                    />
                  </div>

                  {/* Identity */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold tracking-tight truncate">
                        {s.full_name}
                      </h3>
                      {isVerified ? (
                        <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-label="Verified" />
                      ) : (
                        <BadgeX className="w-4 h-4 text-white/30 shrink-0" aria-label="Not verified" />
                      )}
                    </div>
                    <p className="text-xs text-white/40 truncate">
                      {s.college}
                      {s.course ? ` - ${s.course}` : ''}
                      {s.year ? ` (${s.year})` : ''}
                    </p>
                    {(s.skills?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {s.skills!.slice(0, 4).map((k) => (
                          <Badge key={k} variant="outline" className="text-white/60 text-[10px]">
                            {k}
                          </Badge>
                        ))}
                        {s.skills!.length > 4 && (
                          <Badge variant="outline" className="text-white/40 text-[10px]">
                            +{s.skills!.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-white/40">
                      {s.availability && <span>{AVAILABILITY_LABEL[s.availability] ?? s.availability}</span>}
                      <span>
                        {(s.applications ?? 0) > 0
                          ? `${s.applications} ${(s.applications ?? 0) === 1 ? 'application' : 'applications'}`
                          : 'No applications yet'}
                      </span>
                      {s.cv_path && (
                        <span className="inline-flex items-center gap-1">
                          <FileText className="w-3 h-3" /> CV on file
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verify toggle */}
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => toggleVerified(s.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                      isVerified
                        ? 'bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {isVerified ? (
                      <>
                        <BadgeCheck className="w-3.5 h-3.5" /> Verified
                      </>
                    ) : (
                      <>
                        <BadgeX className="w-3.5 h-3.5" /> Not verified
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
        <div className="bg-white/[0.04] border border-amber-400/30 rounded-3xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-amber-300">Generated shortlist</h3>
          <textarea
            readOnly
            value={shortlistText}
            rows={12}
            className="w-full rounded-xl bg-black/30 border border-white/10 p-4 text-xs text-white/80 font-mono focus:outline-none"
            aria-label="Generated shortlist text"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              onClick={copyShortlist}
              className="flex-1 bg-amber-400 text-black font-bold hover:bg-amber-300 h-11"
            >
              <Copy className="w-4 h-4 mr-1" /> {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              type="button"
              onClick={downloadShortlist}
              variant="outline"
              className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10 h-11"
            >
              <Download className="w-4 h-4 mr-1" /> Download .txt
            </Button>
          </div>
        </div>
      )}

      {/* Sticky action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-[#13111a]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 lg:left-72">
          <div className="max-w-2xl mx-auto space-y-2">
            <p className="text-xs text-white/50 text-center sm:text-left">
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
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 [&>option]:bg-[#13111a]"
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
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 disabled:opacity-40 [&>option]:bg-[#13111a]"
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
                className="bg-amber-400 text-black font-bold hover:bg-amber-300 h-11 shrink-0"
              >
                <Star className="w-4 h-4 mr-1" />
                {generating ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

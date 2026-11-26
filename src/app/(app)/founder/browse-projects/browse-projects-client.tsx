'use client';

/**
 * Read-only ledger of other founders' real project briefs.
 * Filtering is local over server-loaded rows; no engagement data is invented.
 */
import { useMemo, useState } from 'react';
import {
  CalendarBlank,
  Clock,
  Globe,
  MapPin,
  UserCircle,
} from '@phosphor-icons/react';
import { SegmentedControl } from '@/components/interactive/segmented-control';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

export interface OtherProject {
  id: string;
  founderName: string;
  title: string;
  description: string | null;
  skills: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  duration: string | null;
  workMode: string;
  deadline: string | null;
  status: string;
  createdAt: string;
}

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Review', value: 'review' },
  { label: 'Completed', value: 'completed' },
];

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  in_progress: 'In progress',
  review: 'In review',
  completed: 'Completed',
};

/** Decorative cue only; the status text above stays the accessible label. */
const STATUS_DOT: Record<string, string> = {
  open: 'bg-[#66bfbf]',
  in_progress: 'bg-[#0b5c5c]',
  review: 'bg-[#ff0063]',
  completed: 'bg-[#0b5c5c]',
};

const DISCLOSURE_CLASS =
  'pressable inline-flex min-h-11 items-center rounded-full border border-[#b9dede] bg-[#eaf6f6] px-2.5 py-0.5 text-xs font-medium text-[#356464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]';

function formatDate(value: string | null): string {
  if (!value) return 'Not set';
  // A date-only value must be built from local calendar parts: new Date('YYYY-MM-DD')
  // is UTC midnight and shows the previous day in UTC-negative time zones.
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = parts
    ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function budgetLabel(min: number | null, max: number | null): string {
  if (min == null && max == null) return 'Not set';
  if (min != null && max != null && max !== min) {
    return `Nu ${min.toLocaleString('en-IN')} – ${max.toLocaleString('en-IN')}`;
  }
  return `Nu ${(min ?? max)?.toLocaleString('en-IN')}`;
}

function workModeLabel(value: string): string {
  if (value === 'onsite') return 'On-site';
  if (value === 'remote') return 'Remote';
  return 'Not set';
}

export function BrowseProjectsClient({
  projects,
}: {
  projects: OtherProject[];
}) {
  const [status, setStatus] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const filtered = useMemo(
    () => (status ? projects.filter((p) => p.status === status) : projects),
    [projects, status],
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <SegmentedControl
            options={FILTERS}
            value={status}
            onChange={setStatus}
            ariaLabel="Filter projects by status"
            className="max-w-full"
          />
        </div>
        <p className="text-xs tabular-nums text-[#356464]">
          {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
          {status ? ` · ${STATUS_LABEL[status] ?? status}` : ''}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={
            projects.length === 0
              ? 'No other projects yet'
              : 'No projects with this status'
          }
          description={
            projects.length === 0
              ? 'When other founders post briefs, they will appear here.'
              : 'Try another status to see the remaining briefs.'
          }
          action={
            projects.length === 0 ? undefined : (
              <button
                type="button"
                onClick={() => setStatus('')}
                className="pressable inline-flex min-h-11 items-center rounded-full bg-[#0b5c5c] px-6 py-3 text-sm font-semibold text-[#ffffff] hover:bg-[#c2004b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2"
              >
                Show all projects
              </button>
            )
          }
        />
      ) : (
        <ul className="divide-y divide-[#b9dede] border-y border-[#b9dede]">
          {filtered.map((p) => (
            <li key={p.id} className="py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words text-base font-semibold leading-snug text-[#0b5c5c]">
                    {p.title}
                  </h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#356464]">
                    <span className="inline-flex min-h-6 items-center gap-1.5">
                      <UserCircle size={16} aria-hidden="true" className="shrink-0" />
                      {p.founderName}
                    </span>
                    <span className="inline-flex min-h-6 items-center gap-1.5 tabular-nums">
                      <CalendarBlank size={16} aria-hidden="true" className="shrink-0" />
                      Posted {formatDate(p.createdAt)}
                    </span>
                  </p>
                </div>
                <Badge className="shrink-0 gap-1.5 border-[#b9dede] bg-[#eaf6f6] text-[#0b5c5c]">
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[p.status] ?? 'bg-[#356464]'}`}
                  />
                  {STATUS_LABEL[p.status] ?? p.status}
                </Badge>
              </div>

              <div>
                <p
                  id={`brief-${p.id}`}
                  className={`mt-3 text-sm leading-6 text-[#356464] ${
                    expandedId === p.id ? '' : 'line-clamp-2'
                  }`}
                >
                  {p.description || 'No description provided.'}
                </p>

                {p.skills.length > 0 && (
                  <div
                    id={`skills-${p.id}`}
                    className="mt-3 flex flex-wrap gap-1.5"
                  >
                    {(expandedId === p.id
                      ? p.skills
                      : p.skills.slice(0, 6)
                    ).map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="border-[#b9dede] bg-[#eaf6f6] text-[#356464]"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {p.skills.length > 6 && (
                      <button
                        type="button"
                        aria-controls={`brief-${p.id} skills-${p.id}`}
                        aria-expanded={expandedId === p.id}
                        aria-label={
                          expandedId === p.id
                            ? `Hide the extra ${p.skills.length - 6} skills`
                            : `Show all ${p.skills.length} skills and the full brief`
                        }
                        onClick={() =>
                          setExpandedId(expandedId === p.id ? null : p.id)
                        }
                        className={DISCLOSURE_CLASS}
                      >
                        {expandedId === p.id
                          ? 'Show less'
                          : `+${p.skills.length - 6}`}
                      </button>
                    )}
                  </div>
                )}

                {p.skills.length <= 6 && p.description && (
                  <button
                    type="button"
                    aria-controls={
                      p.skills.length > 0
                        ? `brief-${p.id} skills-${p.id}`
                        : `brief-${p.id}`
                    }
                    aria-expanded={expandedId === p.id}
                    onClick={() =>
                      setExpandedId(expandedId === p.id ? null : p.id)
                    }
                    className={`${DISCLOSURE_CLASS} mt-2`}
                  >
                    {expandedId === p.id ? 'Show less' : 'View full brief'}
                  </button>
                )}
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#b9dede] pt-4 text-xs sm:grid-cols-4">
                <div className="min-w-0">
                  <dt className="text-[#356464]">Budget</dt>
                  <dd className="mt-0.5 break-words font-medium tabular-nums text-[#0b5c5c]">
                    {budgetLabel(p.budgetMin, p.budgetMax)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="inline-flex items-center gap-1.5 text-[#356464]">
                    <Clock size={14} aria-hidden="true" className="shrink-0" />
                    Duration
                  </dt>
                  <dd className="mt-0.5 break-words font-medium text-[#0b5c5c]">
                    {p.duration || 'Not set'}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="inline-flex items-center gap-1.5 text-[#356464]">
                    {p.workMode === 'onsite' ? (
                      <MapPin size={14} aria-hidden="true" className="shrink-0" />
                    ) : p.workMode === 'remote' ? (
                      <Globe size={14} aria-hidden="true" className="shrink-0" />
                    ) : null}
                    Work mode
                  </dt>
                  <dd className="mt-0.5 font-medium text-[#0b5c5c]">
                    {workModeLabel(p.workMode)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="inline-flex items-center gap-1.5 text-[#356464]">
                    <CalendarBlank size={14} aria-hidden="true" className="shrink-0" />
                    Apply by
                  </dt>
                  <dd className="mt-0.5 font-medium tabular-nums text-[#0b5c5c]">
                    {formatDate(p.deadline)}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 text-xs text-[#356464]">
                Read-only brief. Applicants are managed by the founder who posted it.
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

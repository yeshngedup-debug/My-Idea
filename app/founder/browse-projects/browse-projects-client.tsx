'use client';

/**
 * Read-only ledger of other founders' real project briefs.
 * Filtering is local over server-loaded rows; no engagement data is invented.
 */
import { useMemo, useState } from 'react';
import {
  CalendarBlank,
  Clock,
  CurrencyCircleDollar,
  UserCircle,
} from '@phosphor-icons/react';
import { SegmentedControl } from '@/components/interactive/segmented-control';
import { Badge } from '@/components/ui/badge';

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

function formatDate(value: string | null): string {
  if (!value) return 'Not set';
  const date = new Date(value);
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

export function BrowseProjectsClient({
  projects,
}: {
  projects: OtherProject[];
}) {
  const [status, setStatus] = useState('');
  const filtered = useMemo(
    () => (status ? projects.filter((p) => p.status === status) : projects),
    [projects, status],
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          options={FILTERS}
          value={status}
          onChange={setStatus}
          ariaLabel="Filter projects by status"
          className="max-w-full"
        />
        <p
          role="status"
          aria-live="polite"
          className="text-xs tabular-nums text-[#657069]"
        >
          {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
          {status ? ` · ${STATUS_LABEL[status] ?? status}` : ''}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ded8cb] bg-[#fffefa] p-10 text-center">
          <h2 className="mb-2 text-lg font-semibold text-[#17352b]">
            {projects.length === 0
              ? 'No other projects yet'
              : 'No projects with this status'}
          </h2>
          <p className="text-sm leading-6 text-[#657069]">
            {projects.length === 0
              ? 'When other founders post briefs, they will appear here.'
              : 'Try another status to see the remaining briefs.'}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#ded8cb] border-y border-[#ded8cb]">
          {filtered.map((p) => (
            <li key={p.id} className="py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words text-base font-semibold leading-snug text-[#17352b]">
                    {p.title}
                  </h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#4c5a52]">
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
                <Badge className="shrink-0 gap-1.5 border-[#ded8cb] bg-[#f5f2ea] text-[#17352b]">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                  {STATUS_LABEL[p.status] ?? p.status}
                </Badge>
              </div>

              <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#56645c]">
                {p.description || 'No description provided.'}
              </p>

              {p.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.skills.slice(0, 6).map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="border-[#ded8cb] bg-[#f5f2ea] text-[#4c5a52]"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {p.skills.length > 6 && (
                    <Badge
                      variant="outline"
                      className="border-[#ded8cb] bg-[#f5f2ea] text-[#657069]"
                    >
                      +{p.skills.length - 6}
                    </Badge>
                  )}
                </div>
              )}

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#ded8cb] pt-4 text-xs sm:grid-cols-4">
                <div className="min-w-0">
                  <dt className="text-[#657069]">Budget</dt>
                  <dd className="mt-0.5 break-words font-medium tabular-nums text-[#17352b]">
                    {budgetLabel(p.budgetMin, p.budgetMax)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="inline-flex items-center gap-1.5 text-[#657069]">
                    <Clock size={14} aria-hidden="true" className="shrink-0" />
                    Duration
                  </dt>
                  <dd className="mt-0.5 break-words font-medium text-[#17352b]">
                    {p.duration || 'Not set'}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="inline-flex items-center gap-1.5 text-[#657069]">
                    <CurrencyCircleDollar size={14} aria-hidden="true" className="shrink-0" />
                    Work mode
                  </dt>
                  <dd className="mt-0.5 font-medium text-[#17352b]">
                    {p.workMode === 'onsite' ? 'On-site' : 'Remote'}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="inline-flex items-center gap-1.5 text-[#657069]">
                    <CalendarBlank size={14} aria-hidden="true" className="shrink-0" />
                    Apply by
                  </dt>
                  <dd className="mt-0.5 font-medium tabular-nums text-[#17352b]">
                    {formatDate(p.deadline)}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 text-xs text-[#657069]">
                Read-only brief. Applicants are managed by the founder who posted it.
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

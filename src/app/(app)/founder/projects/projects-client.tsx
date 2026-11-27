'use client';

/**
 * Founder's own project list.
 *
 * The filter narrows only rows already loaded for the signed-in founder; it
 * never fetches or invents data. `initialFilter` comes from an allow-listed
 * `?status=` value on the server page. SegmentedControl keeps every segment in
 * the Tab order; arrow/Home/End move focus and selection together through the
 * shared handler.
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { formatBhutanDate } from '@/lib/format';
import {
  PROJECT_STATUS_LABEL,
  projectStatusLabel,
} from '@/lib/status-labels';
import { EmptyState } from '@/components/ui/empty-state';
import { SegmentedControl } from '@/components/interactive/segmented-control';

export interface FounderProjectRow {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: PROJECT_STATUS_LABEL.open },
  { value: 'in_progress', label: PROJECT_STATUS_LABEL.in_progress },
  { value: 'review', label: PROJECT_STATUS_LABEL.review },
  { value: 'completed', label: PROJECT_STATUS_LABEL.completed },
] as const;

const FILTER_VALUES: string[] = FILTERS.map((item) => item.value);

const STATUS_DOT: Record<string, string> = {
  open: 'bg-secondary',
  in_progress: 'bg-cta',
  review: 'bg-cta',
  completed: 'bg-foreground',
};

const PRIMARY_LINK =
  'pressable inline-flex min-h-11 items-center justify-center rounded-md bg-cta px-4 py-2 text-sm font-semibold text-cta-foreground transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const ROW_LINK =
  'inline-flex min-h-11 items-center rounded text-sm font-semibold text-accent underline decoration-accent underline-offset-4 transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:text-destructive hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function ProjectsClient({
  projects,
  signedIn,
  initialFilter = 'all',
}: {
  projects: FounderProjectRow[];
  signedIn: boolean;
  initialFilter?: string;
}) {
  const [filter, setFilter] = useState<string>(
    FILTERS.some((item) => item.value === initialFilter) ? initialFilter : 'all',
  );
  const pathname = usePathname();

  useEffect(() => {
    function syncFilterFromUrl() {
      const value = new URLSearchParams(window.location.search).get('status');
      setFilter(value && FILTER_VALUES.includes(value) ? value : 'all');
    }

    window.addEventListener('popstate', syncFilterFromUrl);
    return () => window.removeEventListener('popstate', syncFilterFromUrl);
  }, []);

  function handleFilterChange(value: string) {
    const next = FILTER_VALUES.includes(value) ? value : 'all';
    setFilter(next);
    const params = new URLSearchParams(window.location.search);
    if (next === 'all') params.delete('status');
    else params.set('status', next);
    const query = params.toString();
    window.history.pushState(null, '', query ? `${pathname}?${query}` : pathname);
  }

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? projects
        : projects.filter((row) => row.status === filter),
    [projects, filter],
  );

  const date = (value: string) => formatBhutanDate(value);

  const statusLabel = (status: string) => projectStatusLabel(status);

  if (!signedIn) {
    return (
      <EmptyState
        headingLevel="h2"
        title="Sign in to see your projects"
        description="Your posted projects and their applicants live in your founder workspace."
        action={
          <Link href="/login" className={PRIMARY_LINK}>
            Log in
          </Link>
        }
      />
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        headingLevel="h2"
        title="No projects yet"
        description="Post your first short paid project and students can apply right away."
        action={
          <Link href="/founder/projects/post" className={PRIMARY_LINK}>
            Post your first project
          </Link>
        }
      />
    );
  }

  const countLabel =
    filter === 'all'
      ? `Showing all ${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`
      : `Showing ${filtered.length} ${statusLabel(filter).toLowerCase()} ${filtered.length === 1 ? 'project' : 'projects'}`;

  return (
    <div className="space-y-4">
      <h2 className="sr-only">Project list</h2>

      <SegmentedControl
        options={FILTERS.map((item) => ({ label: item.label, value: item.value }))}
        value={filter}
        onChange={handleFilterChange}
        ariaLabel="Filter projects by status"
        className="w-full justify-start sm:w-auto"
      />

      <p className="text-xs tabular-nums text-body-secondary" aria-live="polite">
        {countLabel}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          headingLevel="h3"
          title={`No ${statusLabel(filter).toLowerCase()} projects`}
          description="None of your projects are at this stage right now."
          action={
            <button
              type="button"
              onClick={() => handleFilterChange('all')}
              className="pressable inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-accent transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Show all projects
            </button>
          }
        />
      ) : (
        <>
          {/* Mobile: stacked rows keep the status and the action visible at
              360px instead of squeezing a four-column table. */}
          <ul className="divide-y divide-border border-y border-border sm:hidden">
            {filtered.map((p) => (
              <li key={p.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <p
                    className="min-w-0 line-clamp-2 break-words text-sm font-semibold text-accent"
                    title={p.title}
                  >
                    {p.title}
                  </p>
                  <Badge className="shrink-0 gap-1.5 border-border bg-secondary text-accent">
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[p.status] ?? 'bg-foreground'}`}
                    />
                    {statusLabel(p.status)}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span className="text-xs tabular-nums text-body-secondary">
                    {date(p.created_at)}
                  </span>
                  <Link href={`/founder/projects/${p.id}`} className={ROW_LINK}>
                    View applicants
                    <span className="sr-only"> for {p.title}</span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: the same rows as a bounded table. */}
          <div className="hidden min-w-0 overflow-x-auto border-y border-border sm:block">
            <table className="w-full text-left text-sm" aria-label="My projects">
              <thead className="border-b border-border text-xs font-medium text-body-secondary">
                <tr>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Project
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Posted
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    <span className="sr-only">Applicants</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-secondary"
                  >
                    <th
                      scope="row"
                      className="max-w-xs break-words px-3 py-3 text-left font-semibold text-accent"
                      title={p.title}
                    >
                      {p.title}
                    </th>
                    <td className="px-3 py-3">
                      <Badge className="gap-1.5 border-border bg-secondary text-accent">
                        <span
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[p.status] ?? 'bg-foreground'}`}
                        />
                        {statusLabel(p.status)}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 tabular-nums text-body-secondary">
                      {date(p.created_at)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        href={`/founder/projects/${p.id}`}
                        className={ROW_LINK}
                      >
                        View applicants
                        <span className="sr-only"> for {p.title}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

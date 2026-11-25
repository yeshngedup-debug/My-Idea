'use client';

/**
 * Founder's own project list.
 *
 * The filter narrows only rows already loaded for the signed-in founder; it
 * never fetches or invents data. `initialFilter` comes from an allow-listed
 * `?status=` value on the server page. SegmentedControl keeps every segment in
 * the Tab order; `selectOnArrow` makes arrow/Home/End move focus and selection
 * together through the shared handler.
 */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { SegmentedControl } from '@/components/interactive/segmented-control';

export interface FounderProjectRow {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'review', label: 'In review' },
  { value: 'completed', label: 'Completed' },
] as const;

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  in_progress: 'In progress',
  review: 'In review',
  completed: 'Completed',
};

const STATUS_DOT: Record<string, string> = {
  open: 'bg-[#66bfbf]',
  in_progress: 'bg-[#0b5c5c]',
  review: 'bg-[#ff0063]',
  completed: 'bg-[#356464]',
};

const PRIMARY_LINK =
  'pressable inline-flex min-h-11 items-center justify-center rounded-lg bg-[#ff0063] px-4 py-2 text-sm font-semibold text-[#000000] transition-colors hover:bg-[#d40054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]';
const ROW_LINK =
  'inline-flex min-h-11 items-center rounded text-xs font-semibold text-[#0b5c5c] transition-colors hover:text-[#c2004b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]';

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

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? projects
        : projects.filter((row) => row.status === filter),
    [projects, filter],
  );

  const date = (value: string) =>
    new Date(value).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const statusLabel = (status: string) =>
    STATUS_LABEL[status] ??
    status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');

  if (!signedIn) {
    return (
      <div className="rounded-2xl border border-dashed border-[#b9dede] bg-[#ffffff] p-10 text-center">
        <h2 className="mb-2 text-lg font-semibold text-[#0b5c5c]">
          Sign in to see your projects
        </h2>
        <p className="mb-6 text-sm text-[#356464]">
          Your posted projects and their applicants live in your founder
          workspace.
        </p>
        <Link href="/login" className={PRIMARY_LINK}>
          Log in
        </Link>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#b9dede] bg-[#ffffff] p-10 text-center">
        <h2 className="mb-2 text-lg font-semibold text-[#0b5c5c]">
          No projects yet
        </h2>
        <p className="mb-6 text-sm text-[#356464]">
          Post your first short paid project and students can apply right away.
        </p>
        <Link href="/founder/projects/post" className={`${PRIMARY_LINK} w-full`}>
          Post your first project
        </Link>
      </div>
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
        onChange={setFilter}
        ariaLabel="Filter projects by status"
        className="w-full justify-start sm:w-auto"
        selectOnArrow
      />

      <p
        role="status"
        aria-live="polite"
        className="text-xs tabular-nums text-[#356464]"
      >
        {countLabel}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#b9dede] bg-[#ffffff] p-10 text-center">
          <h3 className="mb-2 text-lg font-semibold text-[#0b5c5c]">
            No {statusLabel(filter).toLowerCase()} projects
          </h3>
          <p className="mb-6 text-sm text-[#356464]">
            None of your projects are at this stage right now.
          </p>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className="pressable inline-flex min-h-11 items-center rounded-lg border border-[#b9dede] bg-[#ffffff] px-4 py-2 text-sm font-semibold text-[#0b5c5c] transition-colors hover:bg-[#eaf6f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]"
          >
            Show all projects
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-2.5 sm:hidden">
            {filtered.map((p) => (
              <li
                key={p.id}
                className="rounded-xl border border-[#b9dede] bg-[#ffffff] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p
                    className="min-w-0 line-clamp-2 break-words text-sm font-semibold text-[#0b5c5c]"
                    title={p.title}
                  >
                    {p.title}
                  </p>
                  <Badge className="shrink-0 gap-1.5 border-[#b9dede] bg-[#eaf6f6] text-[#0b5c5c]">
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[p.status] ?? 'bg-[#356464]'}`}
                    />
                    {statusLabel(p.status)}
                  </Badge>
                </div>
                <p className="mt-1 text-xs tabular-nums text-[#356464]">
                  {date(p.created_at)}
                </p>
                <Link
                  href={`/founder/projects/${p.id}`}
                  className={`mt-3 w-full justify-center ${ROW_LINK}`}
                >
                  View applicants
                  <span className="sr-only"> for {p.title}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden min-w-0 overflow-x-auto rounded-xl border border-[#b9dede] bg-[#ffffff] sm:block">
            <table className="w-full text-left text-sm" aria-label="My projects">
              <thead className="bg-[#eaf6f6] text-xs font-medium text-[#356464]">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold first:rounded-tl-xl"
                  >
                    Project
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Posted
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold last:rounded-tr-xl"
                  >
                    <span className="sr-only">Applicants</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#b9dede]">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors duration-150 hover:bg-[#eaf6f6]"
                  >
                    <th
                      scope="row"
                      className="max-w-xs break-words px-4 py-3.5 text-left font-semibold text-[#0b5c5c]"
                      title={p.title}
                    >
                      {p.title}
                    </th>
                    <td className="px-4 py-3.5">
                      <Badge className="gap-1.5 border-[#b9dede] bg-[#eaf6f6] text-[#0b5c5c]">
                        <span
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[p.status] ?? 'bg-[#356464]'}`}
                        />
                        {statusLabel(p.status)}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-[#356464]">
                      {date(p.created_at)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
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

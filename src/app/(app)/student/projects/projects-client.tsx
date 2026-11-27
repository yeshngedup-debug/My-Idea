'use client';

/**
 * Student project feed. The post structure (header / body / actions) is the
 * only borrowed idea: every value below comes from the project row supplied
 * by the server, and the only actions are the real Apply action and the real
 * project-detail link. No reactions, counters or invented social proof.
 *
 * Cards are dense rows with hairline separators, not floating panels, and the
 * apply result appears in place without any entrance animation.
 */
import { useEffect, useState, startTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { applyToProject } from '@/features/projects/actions';
import { Badge } from '@/components/ui/badge';
import { formatEnGbDate, formatEnGbShortDate } from '@/lib/format';
import { projectStatusLabel } from '@/lib/status-labels';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { StatusMessage } from '@/components/ui/status-message';
import { SegmentedControl } from '@/components/interactive/segmented-control';
import {
  normalizeWorkMode,
  projectFiltersHref,
  type WorkModeFilter,
} from './project-filter-params';

export interface OpenProject {
  id: string;
  title: string;
  description: string | null;
  required_skills: string[] | null;
  duration: string | null;
  budget_min: number | null;
  budget_max: number | null;
  work_mode: string;
  deadline: string | null;
  created_at: string;
  status: string;
  /** Real display name from the founder profile, or null when absent. */
  founderName: string | null;
  /** Relative label computed on the server from created_at. */
  postedLabel: string;
}

export interface ApplyResult {
  ok: boolean;
  message: string;
}

const WORK_MODE_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Remote', value: 'remote' },
  { label: 'Onsite', value: 'onsite' },
];

function statusLabel(status: string): string {
  return projectStatusLabel(status);
}

type ParsedDeadline = { date: Date; dateOnly: boolean };

/** Parse a date-only or timestamp deadline in local time, without UTC drift. */
function parseDeadline(deadline: string): ParsedDeadline | null {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(deadline);
  const date = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3]),
      )
    : new Date(deadline);

  return Number.isNaN(date.getTime()) ? null : { date, dateOnly: Boolean(dateOnly) };
}

/** Date-only deadlines stay open through their local calendar day. */
function deadlinePassed(deadline: string | null): boolean {
  if (!deadline) return false;

  const parsed = parseDeadline(deadline);
  if (!parsed) return false;

  if (parsed.dateOnly) parsed.date.setHours(23, 59, 59, 999);
  return parsed.date.getTime() < Date.now();
}

function formatDeadline(deadline: string, withYear: boolean): string {
  const parsed = parseDeadline(deadline);
  if (!parsed) return 'Date to be confirmed';

  // Formatted from the stored value so the server render and the browser
  // hydration always agree on the calendar day.
  return withYear
    ? formatEnGbDate(deadline, 'Date to be confirmed')
    : formatEnGbShortDate(deadline, 'Date to be confirmed');
}

export function ProjectCard({
  project,
  applied,
  applying,
  onApply,
  detailHref,
}: {
  project: OpenProject;
  applied: boolean;
  applying: boolean;
  onApply: (projectId: string) => Promise<ApplyResult>;
  detailHref: string;
}) {
  const [status, setStatus] = useState<ApplyResult | null>(null);

  function handleApply() {
    startTransition(async () => {
      const result = await onApply(project.id);
      setStatus(result);
    });
  }

  const budget =
    project.budget_min != null && project.budget_max != null
      ? `Nu ${project.budget_min.toLocaleString('en-IN')} - ${project.budget_max.toLocaleString('en-IN')}`
      : 'Budget on request';
  const closed = deadlinePassed(project.deadline);
  const deadline = project.deadline
    ? formatDeadline(project.deadline, false)
    : 'Open until closed';
  const deadlineWithYear = project.deadline
    ? formatDeadline(project.deadline, true)
    : '';
  const skills = project.required_skills ?? [];
  const visibleSkills = skills.slice(0, 5);
  const hiddenSkillCount = Math.max(0, skills.length - visibleSkills.length);

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-accent">
            {project.founderName ?? 'Founder'}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <span>founder</span>
            <span aria-hidden="true">·</span>
            <time dateTime={project.created_at} className="tabular-nums">
              {project.postedLabel}
            </time>
          </p>
        </div>
        <Badge className="mt-0.5 shrink-0 gap-1.5 border-border bg-background text-accent">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-accent"
          />
          {closed ? 'Closed' : statusLabel(project.status)}
        </Badge>
      </header>

      <div className="px-4 py-4 sm:px-5">
        <h3 className="break-words text-base font-semibold leading-6 text-accent">
          {project.title}
        </h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-body-secondary">
          {project.description}
        </p>

        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-3 text-xs">
          {skills.length > 0 && (
            <div className="min-w-0 basis-full">
              <dt className="text-muted-foreground">Skills</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {visibleSkills.map((skill, index) => (
                  <Badge
                    key={`${skill}-${index}`}
                    variant="outline"
                    className="border-border bg-background text-body-secondary"
                  >
                    {skill}
                  </Badge>
                ))}
                {hiddenSkillCount > 0 && (
                  <Link
                    href={detailHref}
                    aria-label={`+${hiddenSkillCount} more required ${hiddenSkillCount === 1 ? 'skill' : 'skills'}`}
                    className="inline-flex min-h-11 items-center rounded text-xs font-medium text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                  >
                    +{hiddenSkillCount} more
                  </Link>
                )}
              </dd>
            </div>
          )}
          <div className="min-w-0">
            <dt className="text-muted-foreground">Budget</dt>
            <dd className="mt-1 break-words font-medium tabular-nums text-accent">
              {budget}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-muted-foreground">Duration</dt>
            <dd className="mt-1 font-medium text-accent">
              {project.duration ?? 'Flexible'}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-muted-foreground">Work mode</dt>
            <dd className="mt-1 font-medium text-accent">
              {project.work_mode === 'onsite' ? 'Onsite' : 'Remote'}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-muted-foreground">Apply by</dt>
            <dd className="mt-1 font-medium tabular-nums text-accent">
              {deadline}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border px-4 py-3 sm:px-5">
        <button
          type="button"
          disabled={applied || applying || closed}
          onClick={handleApply}
          aria-label={
            closed && !applied
              ? deadlineWithYear
                ? `Applications closed on ${deadlineWithYear}`
                : 'Applications closed'
              : undefined
          }
          className={`pressable inline-flex min-h-11 items-center justify-center rounded-md px-5 text-sm font-semibold transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
            applied || closed
              ? 'cursor-not-allowed bg-muted text-muted-foreground'
              : 'bg-cta text-cta-foreground hover:bg-foreground'
          }`}
        >
          {applied
            ? 'Applied'
            : applying
              ? 'Sending...'
              : closed
                ? 'Closed'
                : 'Apply'}
        </button>
        <Link
          href={detailHref}
          className="inline-flex min-h-11 items-center rounded text-sm font-semibold text-accent underline-offset-4 hover:text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          View details
        </Link>
        {status ? (
          <StatusMessage
            tone={status.ok ? 'success' : 'error'}
            className="w-full min-w-0 break-words text-xs sm:w-auto sm:flex-1"
          >
            {status.ok ? 'Applied successfully!' : status.message}
          </StatusMessage>
        ) : null}
      </div>
    </article>
  );
}

export function ProjectsClient({
  projects,
  appliedIds,
  initialQuery = '',
  initialMode = 'all',
}: {
  projects: OpenProject[];
  appliedIds: string[];
  initialQuery?: string;
  initialMode?: WorkModeFilter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery.slice(0, 120));
  const [mode, setMode] = useState<WorkModeFilter>(initialMode);
  // Server props stay authoritative. Local IDs only cover the short gap before
  // router.refresh() returns the updated application list.
  const [locallyApplied, setLocallyApplied] = useState<string[]>([]);
  const [applying, setApplying] = useState<Set<string>>(new Set());

  const trimmedQuery = query.trim();
  const hasFilters = trimmedQuery.length > 0 || mode !== 'all';

  useEffect(() => {
    function syncFromUrl() {
      const params = new URLSearchParams(window.location.search);
      setQuery((params.get('q') ?? '').slice(0, 120));
      setMode(normalizeWorkMode(params.get('mode')));
    }

    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  function writeParams(params: URLSearchParams) {
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
  }

  function handleQueryChange(value: string) {
    const next = value.slice(0, 120);
    setQuery(next);
    const params = new URLSearchParams(window.location.search);
    if (next.trim()) params.set('q', next);
    else params.delete('q');
    writeParams(params);
  }

  function handleModeChange(value: string) {
    const next = normalizeWorkMode(value);
    setMode(next);
    const params = new URLSearchParams(window.location.search);
    if (next === 'all') params.delete('mode');
    else params.set('mode', next);
    writeParams(params);
  }

  function clearFilters() {
    setQuery('');
    setMode('all');
    const params = new URLSearchParams(window.location.search);
    params.delete('q');
    params.delete('mode');
    writeParams(params);
  }

  /** Keep the active filters when a student opens a brief and comes back. */
  function detailHref(projectId: string): string {
    return projectFiltersHref(`/student/projects/${projectId}`, {
      q: trimmedQuery,
      mode,
    });
  }

  const needle = trimmedQuery.toLocaleLowerCase();
  const filteredProjects = projects.filter((project) => {
    if (mode !== 'all' && normalizeWorkMode(project.work_mode) !== mode) {
      return false;
    }
    if (!needle) return true;

    const searchable = [
      project.title,
      project.description ?? '',
      project.founderName ?? '',
      ...(project.required_skills ?? []),
    ]
      .join(' ')
      .toLocaleLowerCase();
    return searchable.includes(needle);
  });

  async function apply(projectId: string): Promise<ApplyResult> {
    setApplying((prev) => new Set(prev).add(projectId));
    try {
      const result = (await applyToProject(projectId)) as ApplyResult | null;
      if (!result || typeof result.ok !== 'boolean' || typeof result.message !== 'string') {
        return { ok: false, message: 'Unexpected response. Try again.' };
      }
      if (result.ok) {
        setLocallyApplied((prev) =>
          prev.includes(projectId) ? prev : [...prev, projectId]
        );
        router.refresh();
      }
      return result;
    } catch {
      // A rejected server action must surface as a visible alert, never as a
      // silently stuck "Sending..." button or an unhandled promise rejection.
      return { ok: false, message: 'Could not send application. Try again.' };
    } finally {
      setApplying((prev) => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <h2 className="sr-only">Open project posts</h2>

      <div className="rounded-xl border border-border bg-card p-4">
        <label
          htmlFor="project-search"
          className="block text-sm font-semibold text-accent"
        >
          Search project briefs
        </label>
        <p id="project-search-hint" className="mt-1 text-xs text-muted-foreground">
          Search by title, skill, or founder.
        </p>
        <Input
          id="project-search"
          type="search"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          placeholder="Search briefs"
          describedBy="project-search-hint"
          className="mt-2"
        />
        <div className="mt-3">
          <SegmentedControl
            options={WORK_MODE_FILTERS}
            value={mode}
            onChange={handleModeChange}
            ariaLabel="Filter by work mode"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-xs text-muted-foreground">
            Showing {filteredProjects.length} of {projects.length}{' '}
            {projects.length === 1 ? 'project brief' : 'project briefs'}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="pressable inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-4 text-xs font-semibold text-accent transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <EmptyState
          title={
            projects.length === 0
              ? 'No current project briefs yet.'
              : 'No briefs match these filters.'
          }
          description={
            projects.length === 0
              ? 'Check back soon for new briefs.'
              : 'Try a different search or clear the filters to see every brief.'
          }
          action={
            hasFilters && projects.length > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="pressable inline-flex min-h-11 items-center justify-center rounded-md bg-cta px-5 text-sm font-semibold text-cta-foreground transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                Show all briefs
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              applied={
                appliedIds.includes(project.id) || locallyApplied.includes(project.id)
              }
              applying={applying.has(project.id)}
              onApply={apply}
              detailHref={detailHref(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

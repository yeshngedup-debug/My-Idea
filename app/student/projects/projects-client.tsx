'use client';

/**
 * Student project feed. The post structure (header / body / actions) is the
 * only borrowed idea: every value below comes from the project row supplied
 * by the server, and the only actions are the real Apply action and the real
 * project-detail link. No reactions, counters or invented social proof.
 */
import { useState, startTransition } from 'react';
import Link from 'next/link';
import { applyToProject } from '@/app/actions/projects';
import { Badge } from '@/components/ui/badge';

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

function statusLabel(status: string): string {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function founderInitial(name: string | null): string {
  const value = (name ?? '').trim();
  return value ? value.charAt(0).toUpperCase() : 'F';
}

export function ProjectCard({
  project,
  applied,
  applying,
  onApply,
}: {
  project: OpenProject;
  applied: boolean;
  applying: boolean;
  onApply: (projectId: string) => Promise<ApplyResult>;
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
  const deadline = project.deadline
    ? new Date(project.deadline).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })
    : 'Open until closed';

  return (
    <article className="overflow-hidden rounded-2xl border border-[#ded8cb] bg-[#fffefa]">
      <header className="flex items-center gap-3 border-b border-[#ded8cb] px-4 py-3 sm:px-5">
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eae5d9] text-sm font-semibold text-[#17352b]"
        >
          {founderInitial(project.founderName)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#17352b]">
            {project.founderName ?? 'Founder'}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-[#657069]">
            <span>founder</span>
            <span aria-hidden="true">·</span>
            <time dateTime={project.created_at} className="tabular-nums">
              {project.postedLabel}
            </time>
          </p>
        </div>
        <Badge className="ml-auto shrink-0 gap-1.5 border-[#ded8cb] bg-[#f5f2ea] text-[#17352b]">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[#17352b]"
          />
          {statusLabel(project.status)}
        </Badge>
      </header>

      <div className="px-4 py-4 sm:px-5">
        <h3 className="text-base font-semibold leading-6 text-[#17352b]">
          {project.title}
        </h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#4c5a52]">
          {project.description}
        </p>

        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#ded8cb] pt-4 text-xs">
          {(project.required_skills ?? []).length > 0 && (
            <div className="min-w-0">
              <dt className="text-[#657069]">Skills</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {(project.required_skills ?? []).slice(0, 5).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="border-[#ded8cb] bg-[#f5f2ea] text-[#4c5a52]"
                  >
                    {skill}
                  </Badge>
                ))}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-[#657069]">Budget</dt>
            <dd className="mt-1 font-medium tabular-nums text-[#17352b]">
              {budget}
            </dd>
          </div>
          <div>
            <dt className="text-[#657069]">Duration</dt>
            <dd className="mt-1 font-medium text-[#17352b]">
              {project.duration ?? 'Flexible'}
            </dd>
          </div>
          <div>
            <dt className="text-[#657069]">Work mode</dt>
            <dd className="mt-1 font-medium text-[#17352b]">
              {project.work_mode === 'onsite' ? 'Onsite' : 'Remote'}
            </dd>
          </div>
          <div>
            <dt className="text-[#657069]">Apply by</dt>
            <dd className="mt-1 font-medium tabular-nums text-[#17352b]">
              {deadline}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-[#ded8cb] px-4 py-3 sm:px-5">
        <button
          type="button"
          disabled={applied || applying}
          onClick={handleApply}
          className={`pressable inline-flex min-h-11 items-center justify-center rounded-lg px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17352b] focus-visible:ring-offset-2 ${
            applied
              ? 'cursor-not-allowed bg-[#f5f2ea] text-[#657069]'
              : 'bg-amber-300 text-[#17352b] hover:bg-amber-200'
          }`}
        >
          {applied ? 'Applied' : applying ? 'Sending...' : 'Apply'}
        </button>
        <Link
          href={`/student/projects/${project.id}`}
          className="inline-flex min-h-11 items-center rounded text-sm font-semibold text-[#17352b] underline-offset-4 hover:text-[#b23c26] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
        >
          View details
        </Link>
      </div>

      {status && (
        <p
          role={status.ok ? 'status' : 'alert'}
          className={`px-4 pb-3 text-xs leading-5 sm:px-5 ${
            status.ok ? 'text-[#17352b]' : 'text-[#b23c26]'
          }`}
        >
          {status.ok ? 'Applied successfully!' : status.message}
        </p>
      )}
    </article>
  );
}

export function ProjectsClient({
  projects,
  appliedIds,
}: {
  projects: OpenProject[];
  appliedIds: string[];
}) {
  const [applied, setApplied] = useState<string[]>(appliedIds);
  const [applying, setApplying] = useState<Set<string>>(new Set());

  async function apply(projectId: string): Promise<ApplyResult> {
    setApplying((prev) => new Set(prev).add(projectId));
    const result = (await applyToProject(projectId)) as ApplyResult;
    setApplying((prev) => {
      const next = new Set(prev);
      next.delete(projectId);
      return next;
    });
    if (result?.ok) {
      setApplied((prev) =>
        prev.includes(projectId) ? prev : [...prev, projectId]
      );
    }
    return result ?? { ok: false, message: 'Unexpected response. Try again.' };
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <h2 className="sr-only">Open project posts</h2>
      {projects.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#ded8cb] bg-[#fffefa] px-6 py-8 text-sm text-[#657069]">
          No open projects right now. Check back soon.
        </p>
      ) : (
        projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            applied={applied.includes(project.id)}
            applying={applying.has(project.id)}
            onApply={apply}
          />
        ))
      )}
    </div>
  );
}

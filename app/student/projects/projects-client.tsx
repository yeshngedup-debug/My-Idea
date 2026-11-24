'use client';

import { useState, startTransition } from 'react';
import Link from 'next/link';
import { applyToProject } from '@/app/actions/projects';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
}

export interface ApplyResult {
  ok: boolean;
  message: string;
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

  return (
    <article className="flex h-full flex-col rounded-xl border border-[#ded8cb] bg-[#fffefa] p-4 transition-colors duration-150 hover:border-[#17352b]/25">
      <h3 className="text-base font-semibold text-[#17352b]">{project.title}</h3>
      <p className="mt-1 text-sm leading-6 text-[#4c5a52]">{project.description}</p>
      <p className="mt-3 text-xs text-[#657069]">
        {project.budget_min != null && project.budget_max != null
          ? `Nu ${project.budget_min.toLocaleString('en-IN')} - ${project.budget_max.toLocaleString('en-IN')}`
          : 'Budget on request'}{' '}
        · {project.duration}
      </p>
      <div className="my-3 flex flex-wrap gap-1.5">
        {(project.required_skills ?? []).slice(0, 5).map((k) => (
          <Badge key={k} variant="outline" className="border-[#ded8cb] bg-[#f5f2ea] text-[#4c5a52]">
            {k}
          </Badge>
        ))}
      </div>
      <Link
        href={`/student/projects/${project.id}`}
        className="mb-3 inline-flex min-h-9 w-fit items-center text-xs font-semibold text-[#17352b] underline-offset-4 hover:text-[#b23c26] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
      >
        View details
      </Link>
      <Button
        type="button"
        disabled={applied || applying}
        onClick={handleApply}
        className={`pressable mt-auto w-full font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] ${
          applied
            ? 'cursor-not-allowed bg-[#f5f2ea] text-[#657069]'
            : 'bg-[#17352b] text-[#fffefa] hover:bg-[#244b3e]'
        }`}
      >
        {applied ? 'Applied' : applying ? 'Sending...' : 'Apply'}
      </Button>
      {status && (
        <p
          role={status.ok ? 'status' : 'alert'}
          className={`mt-2 text-xs leading-5 ${status.ok ? 'text-[#17352b]' : 'text-[#b23c26]'}`}
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
    <div className="space-y-4">
      {projects.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#ded8cb] bg-[#fffefa] px-6 py-8 text-sm text-[#657069]">
          No open projects right now. Check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              applied={applied.includes(p.id)}
              applying={applying.has(p.id)}
              onApply={apply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

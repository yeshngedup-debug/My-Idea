'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { updateProjectStatus, updateApplicationStatus } from '@/app/actions/projects';
import { Badge } from '@/components/ui/badge';
import {
  StatusTimeline,
  FOUNDER_APPLICATION_STEPS,
  PROJECT_STEPS,
} from '@/components/ui/status-timeline';

export interface Applicant {
  id: string;
  status: string;
  created_at: string;
  student_id: string;
  student: {
    full_name: string | null;
    college: string | null;
    course: string | null;
    year: string | null;
    skills: string[] | null;
    availability: string | null;
    cv_path: string | null;
    contact_email: string | null;
  } | null;
}

export interface ProjectInfo {
  id: string;
  title: string;
  status: string;
  budget_min: number | null;
  budget_max: number | null;
  duration: string | null;
  work_mode: string;
}

const APP_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'border-amber-200 bg-amber-50 text-[#8a5a00]' },
  shortlisted: { label: 'Shortlisted', cls: 'border-[#ded8cb] bg-[#f5f2ea] text-[#17352b]' },
  accepted: { label: 'Accepted', cls: 'border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]' },
  rejected: { label: 'Rejected', cls: 'border-[#b23c26]/25 bg-[#b23c26]/8 text-[#b23c26]' },
};

const PROJECT_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'review', label: 'In review' },
  { value: 'completed', label: 'Completed' },
];

export function ProjectDetailClient({
  project,
  applicants,
}: {
  project: ProjectInfo;
  applicants: Applicant[];
}) {
  const [projectStatus, setProjectStatus] = useState(project.status);
  const [appStatus, setAppStatus] = useState<Record<string, string>>(
    Object.fromEntries(applicants.map((a) => [a.id, a.status]))
  );
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, startTransition] = useTransition();

  function setProject(s: string) {
    startTransition(async () => {
      const res = await updateProjectStatus(project.id, s);
      if (res.ok) setProjectStatus(s);
      setStatus({ ok: res.ok, msg: res.message });
    });
  }

  function setApplication(id: string, s: string) {
    startTransition(async () => {
      const res = await updateApplicationStatus(id, s);
      if (res.ok) setAppStatus((prev) => ({ ...prev, [id]: s }));
      setStatus({ ok: res.ok, msg: res.message });
    });
  }

  return (
    <div className="space-y-6">
      <Link
        href="/founder/projects"
        className="inline-flex min-h-9 items-center gap-2 text-sm text-[#4c5a52] transition-colors hover:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
      >
        Back to my projects
      </Link>

      {status && (
        <p role="status" className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
          status.ok
            ? 'border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]'
            : 'border-[#b23c26]/25 bg-[#b23c26]/8 text-[#b23c26]'
        }`}>
          {status.msg}
        </p>
      )}

      <section className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-[#17352b] sm:text-2xl">{project.title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#657069]">
            {project.duration && <span>{project.duration}</span>}
            <span className="inline-flex items-center gap-1">
              {project.work_mode === 'onsite' ? 'On-site' : 'Remote'}
            </span>
            {project.budget_min != null && (
              <span className="font-semibold tabular-nums text-[#17352b]">
                Nu {project.budget_min.toLocaleString('en-IN')}
                {project.budget_max != null && project.budget_max !== project.budget_min ? ` - ${project.budget_max.toLocaleString('en-IN')}` : ''}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PROJECT_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              disabled={busy || projectStatus === s.value}
              onClick={() => setProject(s.value)}
              aria-pressed={projectStatus === s.value}
              className={`inline-flex min-h-9 items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] disabled:opacity-60 ${
                projectStatus === s.value
                  ? 'bg-[#17352b] text-[#fffefa]'
                  : 'border border-[#ded8cb] bg-[#fffefa] text-[#4c5a52] hover:bg-[#f5f2ea]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        <StatusTimeline
          steps={PROJECT_STEPS}
          status={projectStatus}
          label={`Project status for ${project.title}`}
          compact
        />

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#17352b]">
            Applicants <span className="font-normal tabular-nums text-[#657069]">({applicants.length})</span>
          </h2>

          {applicants.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#ded8cb] bg-[#fffefa] p-10 text-center">
              <p className="text-sm text-[#657069]">No applications yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {applicants.map((a) => {
                const s = a.student;
                const current = appStatus[a.id] ?? a.status;
                const badge = APP_BADGE[current] ?? APP_BADGE.pending;
                return (
                  <li key={a.id} className="space-y-3 rounded-xl border border-[#ded8cb] bg-[#fffefa] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-[#17352b]">
                          {s?.full_name ?? 'Applicant'}
                        </h3>
                        <p className="text-xs text-[#657069]">
                          {s?.college ?? 'College not set'}
                          {s?.course ? ` - ${s.course}` : ''}
                          {s?.year ? ` (${s.year} year)` : ''}
                          {s?.availability ? ` - ${s.availability}` : ''}
                        </p>
                      </div>
                      <Badge className={`shrink-0 ${badge.cls}`}>{badge.label}</Badge>
                    </div>

                    <StatusTimeline
                      steps={FOUNDER_APPLICATION_STEPS}
                      status={current}
                      label={`Applicant status for ${s?.full_name ?? 'applicant'}`}
                      compact
                    />

                    {(s?.skills?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {(s?.skills ?? []).slice(0, 6).map((k) => (
                          <Badge key={k} variant="outline" className="border-[#ded8cb] bg-[#f5f2ea] text-[#4c5a52]">{k}</Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      {s?.cv_path && (
                        <a href={`/api/cv/${encodeURIComponent(a.student_id)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1.5 text-[#b23c26] transition-colors hover:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded">
                          View CV
                        </a>
                      )}
                      {s?.contact_email && (
                        <a href={`mailto:${s.contact_email}`} className="inline-flex min-h-9 items-center gap-1.5 break-all text-[#4c5a52] transition-colors hover:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded">
                          {s.contact_email}
                        </a>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-xs tabular-nums text-[#657069]">
                        Applied {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 border-t border-[#ded8cb] pt-3">
                      {(['shortlisted', 'accepted', 'rejected', 'pending'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          disabled={busy || current === st}
                          onClick={() => setApplication(a.id, st)}
                          aria-pressed={current === st}
                          className={`inline-flex min-h-9 items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] disabled:opacity-60 ${
                            current === st
                              ? 'bg-[#17352b] text-[#fffefa]'
                              : 'border border-[#ded8cb] bg-[#fffefa] text-[#4c5a52] hover:bg-[#f5f2ea]'
                          }`}
                        >
                          {st.charAt(0).toUpperCase() + st.slice(1)}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    );
}

'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { updateProjectStatus, updateApplicationStatus } from '@/features/projects/actions';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusMessage } from '@/components/ui/status-message';
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
  pending: { label: 'Pending', cls: 'border-amber-200 bg-amber-50 text-[#0b5c5c]' },
  shortlisted: { label: 'Shortlisted', cls: 'border-[#b9dede] bg-[#eaf6f6] text-[#0b5c5c]' },
  accepted: { label: 'Accepted', cls: 'border-[#66bfbf]/20 bg-[#0b5c5c]/8 text-[#0b5c5c]' },
  rejected: { label: 'Rejected', cls: 'border-[#c2004b]/25 bg-[#ff0063]/8 text-[#c2004b]' },
};

const APPLICATION_STATUSES = [
  'shortlisted',
  'accepted',
  'rejected',
  'pending',
] as const;

/** Mirrors the guard in `app/actions/projects.ts`. */
const APPLICATION_TRANSITIONS: Record<string, readonly string[]> = {
  pending: ['shortlisted', 'rejected'],
  shortlisted: ['accepted', 'rejected'],
  accepted: [],
  rejected: [],
};

function applicantStatusHelp(value: string): string {
  switch (value) {
    case 'pending':
      return 'Next: shortlist or reject. Accept becomes available after shortlisting.';
    case 'shortlisted':
      return 'Next: accept or reject. You cannot move this applicant back to pending.';
    case 'accepted':
      return 'Accepted is final. There is no reopen action.';
    case 'rejected':
      return 'Rejected is final. There is no reopen action.';
    default:
      return 'No next step is available for this status.';
  }
}

const PROJECT_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'review', label: 'In review' },
  { value: 'completed', label: 'Completed' },
];

function projectStatusLabel(value: string): string {
  return PROJECT_STATUSES.find((s) => s.value === value)?.label ?? value;
}

function applicantStatusLabel(value: string): string {
  return APP_BADGE[value]?.label ?? value;
}

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
      try {
        const res = await updateProjectStatus(project.id, s);
        if (res.ok) setProjectStatus(s);
        setStatus({
          ok: res.ok,
          msg: res.ok
            ? `Project status updated: ${project.title} is now ${projectStatusLabel(s)}.`
            : res.message,
        });
      } catch (error) {
        console.error('Founder project detail: project status update failed', error);
        setStatus({
          ok: false,
          msg: 'Could not update project status. Try again.',
        });
      }
    });
  }

  function setApplication(id: string, s: string, name: string) {
    startTransition(async () => {
      try {
        const res = await updateApplicationStatus(id, s);
        if (res.ok) setAppStatus((prev) => ({ ...prev, [id]: s }));
        setStatus({
          ok: res.ok,
          msg: res.ok
            ? `Applicant status updated: ${name} is now ${applicantStatusLabel(s)}.`
            : res.message,
        });
      } catch (error) {
        console.error('Founder project detail: applicant status update failed', error);
        setStatus({
          ok: false,
          msg: `Could not update ${name}'s status. Try again.`,
        });
      }
    });
  }

  return (
    <div className="space-y-6" aria-busy={busy}>
      <Link
        href="/founder/projects"
        className="inline-flex min-h-9 items-center gap-2 text-sm text-[#356464] transition-colors hover:text-[#0b5c5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] rounded"
      >
        Back to my projects
      </Link>

      {status && (
        <StatusMessage
          key={`${status.ok ? 'success' : 'error'}:${status.msg}`}
          tone={status.ok ? 'success' : 'error'}
        >
          {status.msg}
        </StatusMessage>
      )}

      <section className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-[#0b5c5c] sm:text-2xl">{project.title}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#356464]">
            {project.duration && <span>{project.duration}</span>}
            <span className="inline-flex items-center gap-1">
              Work mode:{' '}
              <span className="font-semibold text-[#0b5c5c]">
                {project.work_mode === 'onsite' ? 'On-site' : 'Remote'}
              </span>
            </span>
            {project.budget_min != null && (
              <span className="font-semibold tabular-nums text-[#0b5c5c]">
                Nu {project.budget_min.toLocaleString('en-IN')}
                {project.budget_max != null && project.budget_max !== project.budget_min ? ` - ${project.budget_max.toLocaleString('en-IN')}` : ''}
              </span>
            )}
          </p>
        </div>
        <div
          role="group"
          aria-label={`Project status for ${project.title}`}
          className="flex flex-wrap gap-1.5"
        >
          {PROJECT_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              disabled={busy || projectStatus === s.value}
              onClick={() => setProject(s.value)}
              aria-pressed={projectStatus === s.value}
              className={`pressable inline-flex min-h-9 items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] disabled:opacity-60 ${
                projectStatus === s.value
                  ? 'bg-[#0b5c5c] text-[#ffffff]'
                  : 'border border-[#b9dede] bg-[#ffffff] text-[#356464] hover:bg-[#eaf6f6]'
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
          <h2 className="text-base font-semibold text-[#0b5c5c]">
            Applicants <span className="font-normal tabular-nums text-[#356464]">({applicants.length})</span>
          </h2>

          {applicants.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="When a student applies, you can review their details here."
            />
          ) : (
            <ul className="space-y-3">
              {applicants.map((a) => {
                const s = a.student;
                const current = appStatus[a.id] ?? a.status;
                const badge = APP_BADGE[current] ?? APP_BADGE.pending;
                const statusHelpId = `applicant-status-help-${a.id}`;
                return (
                  <li key={a.id} className="space-y-3 rounded-xl border border-[#b9dede] bg-[#ffffff] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-[#0b5c5c]">
                          {s?.full_name ?? 'Applicant'}
                        </h3>
                        <p className="text-xs text-[#356464]">
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
                          <Badge key={k} variant="outline" className="border-[#b9dede] bg-[#eaf6f6] text-[#356464]">{k}</Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      {s?.cv_path && (
                        <a href={`/api/cv/${encodeURIComponent(a.student_id)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1.5 text-[#c2004b] transition-colors hover:text-[#0b5c5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] rounded">
                          View CV
                          <span className="sr-only">
                            {' '}for {s?.full_name ?? 'this applicant'} (opens in a new tab)
                          </span>
                        </a>
                      )}
                      {s?.contact_email && (
                        <a href={`mailto:${s.contact_email}`} className="inline-flex min-h-9 items-center gap-1.5 break-all text-[#356464] transition-colors hover:text-[#0b5c5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] rounded">
                          {s.contact_email}
                        </a>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-xs tabular-nums text-[#356464]">
                        Applied {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <div
                      role="group"
                      aria-label={`Applicant status for ${s?.full_name ?? 'applicant'}`}
                      aria-describedby={statusHelpId}
                      className="space-y-2 border-t border-[#b9dede] pt-3"
                    >
                      <div className="flex flex-wrap gap-2">
                        {APPLICATION_STATUSES.map((st) => {
                          const isCurrent = current === st;
                          const isAllowed = (APPLICATION_TRANSITIONS[current] ?? []).includes(st);
                          return (
                            <button
                              key={st}
                              type="button"
                              disabled={busy || isCurrent || !isAllowed}
                              onClick={() => setApplication(a.id, st, s?.full_name ?? 'this applicant')}
                              aria-pressed={isCurrent}
                              className={`pressable inline-flex min-h-9 items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] disabled:cursor-not-allowed disabled:opacity-60 ${
                                isCurrent
                                  ? 'bg-[#0b5c5c] text-[#ffffff]'
                                  : 'border border-[#b9dede] bg-[#ffffff] text-[#356464] hover:bg-[#eaf6f6]'
                              }`}
                            >
                              {applicantStatusLabel(st)}
                            </button>
                          );
                        })}
                      </div>
                      <p id={statusHelpId} className="text-xs text-body-secondary">
                        {applicantStatusHelp(current)}
                      </p>
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

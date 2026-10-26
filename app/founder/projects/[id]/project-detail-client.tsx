'use client';

/**
 * Project detail client — applicant cards with profile info, CV links,
 * application status buttons, and project status controls.
 */
import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  FileText,
  Mail,
  Clock,
  MapPin,
  ArrowLeft,
} from 'lucide-react';
import { updateProjectStatus, updateApplicationStatus } from '@/app/actions/projects';
import { Badge } from '@/components/ui/badge';

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
  pending: { label: 'Pending', cls: 'bg-amber-400/10 text-amber-300' },
  shortlisted: { label: 'Shortlisted', cls: 'bg-blue-400/10 text-blue-300' },
  accepted: { label: 'Accepted', cls: 'bg-emerald-400/10 text-emerald-300' },
  rejected: { label: 'Rejected', cls: 'bg-red-400/10 text-red-300' },
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
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to my projects
      </Link>

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
          {status.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0" />
          )}
          {status.msg}
        </p>
      )}

      {/* Project header */}
      <section className="bg-[#13111a] ring-1 ring-white/10 rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{project.title}</h2>
            <p className="text-xs text-white/40 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              {project.duration && <span>{project.duration}</span>}
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {project.work_mode === 'onsite' ? 'On-site' : 'Remote'}
              </span>
              {project.budget_min != null && (
                <span className="text-amber-400 font-semibold">
                  Nu {project.budget_min.toLocaleString('en-IN')}
                  {project.budget_max != null && project.budget_max !== project.budget_min
                    ? ` - ${project.budget_max.toLocaleString('en-IN')}`
                    : ''}
                </span>
              )}
            </p>
          </div>
          {/* Project status controls */}
          <div className="flex flex-wrap gap-1.5">
            {PROJECT_STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                disabled={busy || projectStatus === s.value}
                onClick={() => setProject(s.value)}
                aria-pressed={projectStatus === s.value}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-60 ${
                  projectStatus === s.value
                    ? 'bg-amber-400 text-black'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Applicants */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold">
          Applicants <span className="text-white/40 font-normal">({applicants.length})</span>
        </h3>

        {applicants.length === 0 ? (
          <div className="bg-[#13111a] ring-1 ring-white/10 rounded-xl p-10 text-center">
            <p className="text-sm text-white/50">No applications yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {applicants.map((a) => {
              const s = a.student;
              const current = appStatus[a.id] ?? a.status;
              const badge = APP_BADGE[current] ?? APP_BADGE.pending;
              return (
                <li
                  key={a.id}
                  className="bg-[#13111a] ring-1 ring-white/10 rounded-xl p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-base font-extrabold tracking-tight truncate">
                        {s?.full_name ?? 'Applicant'}
                      </h4>
                      <p className="text-xs text-white/40">
                        {s?.college ?? 'College not set'}
                        {s?.course ? ` - ${s.course}` : ''}
                        {s?.year ? ` (${s.year} year)` : ''}
                        {s?.availability ? ` - ${s.availability}` : ''}
                      </p>
                    </div>
                    <Badge className={`shrink-0 ${badge.cls}`}>{badge.label}</Badge>
                  </div>

                  {(s?.skills?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {s!.skills!.slice(0, 6).map((k) => (
                        <Badge key={k} variant="outline" className="text-white/60">
                          {k}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    {s?.cv_path && (
                      <a
                        href={`/api/cv/${a.student_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <FileText className="w-4 h-4" /> View CV
                      </a>
                    )}
                    {s?.contact_email && (
                      <a
                        href={`mailto:${s.contact_email}`}
                        className="inline-flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
                      >
                        <Mail className="w-4 h-4" /> {s.contact_email}
                      </a>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-white/40 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      Applied{' '}
                      {new Date(a.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  {/* Application status buttons */}
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
                    {(['shortlisted', 'accepted', 'rejected', 'pending'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={busy || current === st}
                        onClick={() => setApplication(a.id, st)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-60 ${
                          current === st
                            ? 'bg-amber-400 text-black'
                            : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
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

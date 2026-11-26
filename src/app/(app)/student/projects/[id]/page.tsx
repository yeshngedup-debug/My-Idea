/**
 * Student-facing project details.
 * Students open this from their own workspace — the founder area is
 * role-gated and is never linked from the student side.
 */
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { applyToProject, type ProjectResult } from '@/features/projects/actions';
import {
  getProfile,
  getProfileRole,
  getProject,
  listStudentAppliedProjectIds,
} from '@/lib/neon-data';
import { Badge } from '@/components/ui/badge';
import { SubmitButton } from '@/components/ui/submit-button';

export const metadata = { title: 'Project Details' };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ApplyNotice =
  | 'applied'
  | 'already'
  | 'closed'
  | 'signed-out'
  | 'not-student'
  | 'error';

const APPLY_NOTICES: Record<
  ApplyNotice,
  { role: 'status' | 'alert'; message: string }
> = {
  applied: {
    role: 'status',
    message: 'Application sent.',
  },
  already: {
    role: 'status',
    message: 'You already applied to this project.',
  },
  closed: {
    role: 'alert',
    message: 'Applications are closed for this brief.',
  },
  'signed-out': {
    role: 'alert',
    message: 'Your session ended. Sign in and try again.',
  },
  'not-student': {
    role: 'alert',
    message: 'Only students can apply to projects.',
  },
  error: {
    role: 'alert',
    message: 'Could not send your application. Try again.',
  },
};

type ProjectDetail = {
  id: string;
  title: string;
  description: string | null;
  required_skills: string[] | null;
  duration: string | null;
  work_mode: string;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  status: string;
  created_at: string;
};

function statusLabel(status: string): string {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Neon stores deadline as a date; mapProject returns it as an ISO string. */
function localDate(value: string): Date {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (dateOnly) {
    return new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
    );
  }
  return new Date(value);
}

function formatDate(value: string): string {
  const date = localDate(value);
  if (Number.isNaN(date.getTime())) return 'Date not set';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** A date-only deadline stays open through the local calendar day. */
function deadlinePassed(deadline: string | null): boolean {
  if (!deadline) return false;

  const date = localDate(deadline);
  if (Number.isNaN(date.getTime())) return false;

  const endOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
  return endOfDay.getTime() < Date.now();
}

function readApplyNotice(
  value: string | string[] | undefined,
): ApplyNotice | null {
  if (typeof value !== 'string') return null;
  return Object.prototype.hasOwnProperty.call(APPLY_NOTICES, value)
    ? (value as ApplyNotice)
    : null;
}

function applyNoticeForResult(result: ProjectResult): ApplyNotice {
  if (result.ok) return 'applied';
  if (result.message === 'You already applied to this project.') return 'already';
  if (result.message === 'This project is no longer open.') return 'closed';
  if (result.message === 'Not signed in.') return 'signed-out';
  if (result.message === 'Only students can apply.') return 'not-student';
  return 'error';
}

function finishApply(projectId: string, notice: ApplyNotice): never {
  revalidatePath(`/student/projects/${projectId}`);
  redirect(`/student/projects/${projectId}?apply=${notice}`);
}

/**
 * Route-local form action. It uses the shared apply action unchanged, then
 * refreshes this detail route so the button and status text settle on real data.
 */
async function applyFromDetail(
  projectId: string,
  formData: FormData,
): Promise<void> {
  'use server';
  void formData;

  let notice: ApplyNotice = 'error';
  try {
    const project = await getProject(projectId);
    if (!project) {
      notice = 'error';
    } else if (project.status !== 'open' || deadlinePassed(project.deadline)) {
      notice = 'closed';
    } else {
      notice = applyNoticeForResult(await applyToProject(projectId));
    }
  } catch {
    notice = 'error';
  }

  finishApply(projectId, notice);
}

export default async function StudentProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;

  // Malformed IDs never reach Neon, where they would become a raw data error.
  if (!UUID_PATTERN.test(id)) notFound();

  const user = await getUser();

  if (!user) notFound();

  const [row, role, appliedIds] = await Promise.all([
    getProject(id),
    getProfileRole(user.id),
    listStudentAppliedProjectIds(user.id),
  ]);

  // Students may open live briefs, or a brief they already applied to after it
  // moves on. Anything else is indistinguishable from a missing project.
  if (!row) notFound();
  if (role !== 'student') notFound();
  const applied = appliedIds.includes(row.id);
  if (row.status !== 'open' && !applied) notFound();

  const [{ apply }, founder] = await Promise.all([
    searchParams,
    getProfile(row.founder_id),
  ]);
  const noticeKey = readApplyNotice(apply);
  const notice = noticeKey ? APPLY_NOTICES[noticeKey] : null;

  const project: ProjectDetail = {
    id: row.id,
    title: row.title,
    description: row.description,
    required_skills: row.required_skills,
    duration: row.duration,
    work_mode: row.work_mode,
    budget_min: row.budget_min,
    budget_max: row.budget_max,
    deadline: row.deadline,
    status: row.status,
    created_at: row.created_at,
  };

  const skills = project.required_skills ?? [];
  const closedByDeadline = deadlinePassed(project.deadline);
  const canApply =
    project.status === 'open' && !applied && !closedByDeadline;
  const badgeLabel =
    project.status === 'open' && closedByDeadline
      ? 'Closed'
      : statusLabel(project.status);

  const budget =
    project.budget_min != null && project.budget_max != null
      ? `Nu ${project.budget_min.toLocaleString('en-IN')} - ${project.budget_max.toLocaleString('en-IN')}`
      : 'Budget on request';

  const fields = [
    { label: 'Budget', value: budget },
    { label: 'Duration', value: project.duration ?? 'Flexible' },
    {
      label: 'Work mode',
      value: project.work_mode === 'onsite' ? 'Onsite' : 'Remote',
    },
    {
      label: 'Apply by',
      value: project.deadline ? formatDate(project.deadline) : 'Open until closed',
    },
    {
      label: 'Posted',
      value: formatDate(project.created_at),
    },
  ];

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/student/projects"
          className="mb-6 inline-flex min-h-9 items-center gap-2 rounded text-sm text-body-secondary transition-colors motion-reduce:transition-none! hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Back to open projects
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="break-words text-xl font-semibold tracking-tight text-primary sm:text-2xl">
                {project.title}
              </h1>
              <p className="mt-1 text-xs text-body-secondary">
                Posted by {founder?.full_name ?? 'Founder'}
              </p>
            </div>
            <Badge className="shrink-0 gap-1.5 border-border bg-background text-primary">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-primary"
              />
              {badgeLabel}
            </Badge>
          </div>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-body-secondary">
            {project.description?.trim()
              ? project.description
              : 'No description provided.'}
          </p>

          <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label}>
                <dt className="text-xs font-medium text-muted-foreground">
                  {field.label}
                </dt>
                <dd className="mt-1 break-words text-sm font-semibold tabular-nums text-primary">
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 border-t border-border pt-6">
            <h2 className="text-xs font-medium text-muted-foreground">
              Required skills
            </h2>
            {skills.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {skills.map((skill, index) => (
                  <Badge
                    key={`${skill}-${index}`}
                    variant="outline"
                    className="border-border bg-background text-body-secondary"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-body-secondary">
                No specific skills listed.
              </p>
            )}
          </div>

          <div className="mt-6 border-t border-border pt-6">
            {notice && (
              <p
                role={notice.role}
                className={`mb-4 break-words rounded-lg border px-4 py-3 text-sm leading-6 ${
                  notice.role === 'status'
                    ? 'border-border bg-background text-primary'
                    : 'border-border bg-background text-destructive'
                }`}
              >
                {notice.message}
                {noticeKey === 'applied' && (
                  <>
                    {' '}
                    <Link
                      href="/student/applications"
                      className="rounded font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Track it in Applications.
                    </Link>
                  </>
                )}
              </p>
            )}

            {canApply ? (
              <form action={applyFromDetail.bind(null, project.id)}>
                <SubmitButton pendingLabel="Sending...">
                  Apply to this project
                </SubmitButton>
              </form>
            ) : (
              <div>
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-lg bg-muted px-5 text-sm font-semibold text-muted-foreground"
                >
                  {applied ? 'Applied' : 'Applications closed'}
                </button>
                <p className="mt-2 text-xs leading-5 text-body-secondary">
                  {applied
                    ? 'Your application is on file. '
                    : closedByDeadline && project.deadline
                      ? `Applications closed on ${formatDate(project.deadline)}. `
                      : `This brief is now ${statusLabel(project.status)}. `}
                  <Link
                    href="/student/applications"
                    className="rounded font-semibold text-primary underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Track applications
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

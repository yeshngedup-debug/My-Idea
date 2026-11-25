/**
 * Student full profile — founder view.
 */
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import {
  getProfileRole,
  getStudentProfile,
  hasShortlistWithOrder,
  listConfirmedOrderProjectIds,
  listFounderShortlists,
  listProjectsByFounder,
  listStudentApplications,
} from '@/lib/neon-data';
import { Badge } from '@/components/ui/badge';
import { ShortlistButton } from './shortlist-button';

export const metadata = { title: 'Student Profile | Bhutan Tech Connect' };

const AVAILABILITY_LABEL: Record<string, string> = {
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  evenings: 'Evenings',
  full_time: 'Full time',
  flexible: 'Flexible',
};

const APPLICATION_STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  shortlisted: 'Shortlisted',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export default async function StudentProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const user = await getUser();

  if (!user) redirect('/login');

  // Defence in depth: the founder area is already gated by proxy, but the
  // page must not serve profile data to a different role if that changes.
  const viewerRole = await getProfileRole(user.id);
  if (viewerRole !== 'founder') redirect('/student');

  const targetRole = await getProfileRole(id);

  if (targetRole !== 'student') notFound();

  const sp = await getStudentProfile(id);

  if (!sp || !sp.cv_path) notFound();

  // Mirror the server-side gates before rendering either primary action. The
  // application list also supplies the project/status context for this founder.
  const [orders, founderShortlists, projects, applications] = await Promise.all([
    listConfirmedOrderProjectIds(user.id),
    listFounderShortlists(user.id),
    listProjectsByFounder(user.id),
    listStudentApplications(id),
  ]);
  const founderProjectIds = new Set(projects.map((project) => project.id));
  const founderApplication = applications.find((application) =>
    founderProjectIds.has(application.project_id)
  );
  const hasApplied = Boolean(founderApplication);
  const generalUnlocked = orders.some((order) => order.projectId == null);
  const confirmedProjectIds = orders
    .map((order) => order.projectId)
    .filter((projectId): projectId is string => projectId != null);
  const canRequestShortlist = hasApplied || generalUnlocked;
  const canViewCv =
    hasApplied ||
    (await hasShortlistWithOrder(
      user.id,
      id,
      generalUnlocked,
      confirmedProjectIds
    ));

  // Only a general founder row counts as an existing request. Admin and
  // project-scoped rows must not disable this action.
  const alreadyShortlisted = founderShortlists.some(
    (row) =>
      row.student_id === id && row.source === 'founder' && row.project_id == null
  );

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/founder/browse-students" className="inline-flex min-h-11 items-center rounded text-sm text-body-secondary transition-colors motion-reduce:transition-none hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Browse students
          </Link>
          <div className="min-w-0 text-right">
            <h1 className="break-words text-xl font-semibold tracking-tight text-primary sm:text-2xl">{sp.full_name}</h1>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-body-secondary">
            <span>{sp.college}{sp.course ? ` - ${sp.course}` : ''}{sp.year ? ` (${sp.year} year)` : ''}</span>
            {sp.availability && (
              <Badge variant="outline">{AVAILABILITY_LABEL[sp.availability] ?? sp.availability}</Badge>
            )}
          </div>

          {founderApplication?.project && (
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5 text-body-secondary">
              <span>Latest application to your project</span>
              <Link
                href={`/founder/projects/${encodeURIComponent(founderApplication.project.id)}`}
                className="rounded font-semibold text-primary underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {founderApplication.project.title}
              </Link>
              <span aria-hidden="true">·</span>
              <span>{APPLICATION_STATUS_LABEL[founderApplication.status] ?? founderApplication.status}</span>
            </p>
          )}

          {(sp.skills?.length ?? 0) > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(sp.skills ?? []).map((k: string) => (
                <Badge key={k} variant="outline">{k}</Badge>
              ))}
            </div>
          )}

          {sp.bio && (
            <div className="mt-6 border-t border-border pt-6">
              <h2 className="mb-1 text-sm font-semibold text-primary">Bio</h2>
              <p className="whitespace-pre-line text-sm leading-6 text-body-secondary">{sp.bio}</p>
            </div>
          )}

          <div className="mt-6 border-t border-border pt-6">
            <h2 className="mb-2 text-sm font-semibold text-primary">CV</h2>
            {canViewCv ? (
              <a href={`/api/cv/${encodeURIComponent(id)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-primary transition-colors motion-reduce:transition-none hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                View CV (PDF)
              </a>
            ) : (
              <p className="text-xs leading-5 text-body-secondary">
                CV access opens when this student applies to one of your projects,
                or when a paid shortlist request for this student is confirmed.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">Interested in working with {sp.full_name}?</p>
            <ShortlistButton
              studentId={id}
              alreadyShortlisted={alreadyShortlisted}
              canRequest={canRequestShortlist}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

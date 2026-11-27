/**
 * Browse Students — server component.
 * Loads only students with a completed profile AND an uploaded CV.
 * Search, availability filters and shortlist requests are client-side.
 */
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import {
  getProfileRole,
  listBrowseableStudents,
  listConfirmedOrderProjectIds,
  listFounderShortlists,
  listProjectApplicants,
  listProjectsByFounder,
} from '@/lib/neon-data';
import { PinnedHeadingSection } from '@/components/layout/pinned-heading-section';
import { WorkspacePageHeading } from '@/components/layout/workspace-page-heading';
import { BrowseClient, type StudentCard } from './browse-client';

export const metadata = { title: 'Browse Students' };

export default async function BrowseStudentsPage() {
  const user = await getUser();

  // Authenticate and authorize before any directory data is read. The proxy
  // normally handles this; the page must not fail open on its own.
  if (!user) redirect('/login');
  const role = await getProfileRole(user.id);
  if (role !== 'founder') redirect('/student');

  const [rows, existing, projects, orders] = await Promise.all([
    listBrowseableStudents(),
    listFounderShortlists(user.id),
    listProjectsByFounder(user.id),
    listConfirmedOrderProjectIds(user.id),
  ]);

  // Only a founder's general row is idempotent for the general request the
  // client sends. Admin and project rows must not disable that button.
  const shortlistedIds = existing
    .filter((row) => row.source === 'founder' && row.project_id == null)
    .map((row) => row.student_id);

  // Mirror the request action's gate: a request is viable when the student
  // applied to any project this founder owns, or a general shortlist order is
  // confirmed. Everyone else gets a link to the shortlist page instead.
  const generalOrderConfirmed = orders.some((o) => o.projectId == null);
  const applicantLists = await Promise.all(
    projects.map((project) => listProjectApplicants(project.id))
  );
  const applicantIds = new Set(applicantLists.flat().map((a) => a.student_id));

  const students: StudentCard[] = rows
    .map((s) => ({
      id: s.id,
      full_name: s.full_name,
      college: s.college,
      course: s.course,
      year: s.year,
      skills: s.skills,
      bio: s.bio,
      availability: s.availability,
      canRequestShortlist: generalOrderConfirmed || applicantIds.has(s.id),
    }))
    .filter(
      (s) => (s.full_name ?? '').trim() !== '' && (s.college ?? '').trim() !== ''
    );

  return (
    <section>
      <div className="mx-auto max-w-5xl">
        <PinnedHeadingSection
          heading={
            <WorkspacePageHeading
              eyebrow="Founder workspace"
              title="Browse Students"
              description="Find students by skill, college and availability."
            />
          }
        >
          <BrowseClient students={students} shortlistedIds={shortlistedIds} />
        </PinnedHeadingSection>
      </div>
    </section>
  );
}

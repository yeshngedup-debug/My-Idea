/**
 * Admin — Students management. Rank, verify profiles, select for shortlist.
 * Server loads students (with application counts), founders and projects
 * from Neon, then hands them to the interactive AdminStudentsClient.
 *
 * Identity is used only to identify the caller. Every table
 * read goes through typed Neon helpers, and admin access is re-checked here
 * and again inside every server action — the proxy is not the only gate.
 */
import { getUser } from '@/lib/auth';
import {
  getProfileRole,
  listAdminStudents,
  listAllApplicationStudentIds,
  listFounderProfiles,
  listAllProjects,
} from '@/lib/neon-data';
import { PinnedHeadingSection } from '@/components/layout/pinned-heading-section';
import { WorkspacePageHeading } from '@/components/layout/workspace-page-heading';
import {
  AdminStudentsClient,
  type AdminStudent,
} from './admin-students-client';

export const metadata = { title: 'Students | Admin | Bhutan Tech Connect' };

// Reads the session via cookies(), so it can only be rendered on demand.
export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage() {
  let students: AdminStudent[] = [];
  let founders: { id: string; full_name: string | null }[] = [];
  let projects: { id: string; title: string; founder_id: string }[] = [];
  let loadError: string | null = null;

  try {
    const user = await getUser();

    if (!user) {
      loadError = 'Your session has expired. Sign in again to continue.';
    } else {
      // Defense in depth: never expose the roster on a stale or forged role.
      const role = await getProfileRole(user.id);
      if (role !== 'admin') {
        loadError = 'Admins only.';
      } else {
        // Independent lookups — one round-trip.
        const [sp, apps, f, p] = await Promise.all([
          listAdminStudents(),
          listAllApplicationStudentIds(),
          listFounderProfiles(),
          listAllProjects(),
        ]);

        // Application counts per student.
        const counts = new Map<string, number>();
        for (const studentId of apps) {
          counts.set(studentId, (counts.get(studentId) ?? 0) + 1);
        }

        students = sp.map((s) => ({
          id: s.id,
          full_name: s.full_name,
          college: s.college,
          course: s.course,
          year: s.year,
          skills: s.skills,
          availability: s.availability,
          cv_path: s.cv_path,
          rank: s.rank,
          verified: s.verified,
          applications: counts.get(s.id) ?? 0,
        }));

        founders = f;
        projects = p;
      }
    }
  } catch (error) {
    // Logged on the server; the visitor gets a retryable message, not a stack.
    console.error('[admin/students] Failed to load students', error);
    loadError = 'Could not load students. Try again.';
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <PinnedHeadingSection
          heading={
            <WorkspacePageHeading
              eyebrow="Admin workspace"
              title="Students"
              description="Review profiles, verify identity and build a ranked shortlist."
            />
          }
        >
          <div className="rounded-2xl border border-[#ded8cb] bg-[#f5f2ea] p-4 sm:p-6">
            <AdminStudentsClient
              students={students}
              founders={founders}
              projects={projects}
              loadError={loadError}
            />
          </div>
        </PinnedHeadingSection>
      </div>
    </section>
  );
}

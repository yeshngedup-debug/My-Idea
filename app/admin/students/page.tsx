/**
 * Admin — Students management. Rank, verify profiles, select for shortlist.
 * Server loads students (with application counts), founders and projects
 * from Neon, then hands them to the interactive AdminStudentsClient.
 */
import { createClient } from '@/lib/supabase/server';
import {
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

export default async function AdminStudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let students: AdminStudent[] = [];
  let founders: { id: string; full_name: string | null }[] = [];
  let projects: { id: string; title: string; founder_id: string }[] = [];

  if (user) {
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
      bio: s.bio,
      availability: s.availability,
      cv_path: s.cv_path,
      rank: s.rank,
      verified: s.verified,
      contact_email: s.contact_email,
      applications: counts.get(s.id) ?? 0,
    }));

    founders = f;
    projects = p;
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
            />
          </div>
        </PinnedHeadingSection>
      </div>
    </section>
  );
}

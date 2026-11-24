/**
 * Browse Students — server component.
 * Loads only students with a completed profile AND an uploaded CV.
 * Search, availability filters and shortlist requests are client-side.
 */
import { createClient } from '@/lib/supabase/server';
import { listBrowseableStudents, listShortlistedStudentIds } from '@/lib/neon-data';
import { PinnedHeadingSection } from '@/components/layout/pinned-heading-section';
import { BrowseClient, type StudentCard } from './browse-client';

export const metadata = { title: 'Browse Students | Bhutan Tech Connect' };

export default async function BrowseStudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let students: StudentCard[] = [];
  let shortlistedIds: string[] = [];

  if (user) {
    // Independent lookups — one round-trip.
    const [rows, existing] = await Promise.all([
      listBrowseableStudents(),
      listShortlistedStudentIds(user.id),
    ]);

    students = rows
      .map((s) => ({
        id: s.id,
        full_name: s.full_name,
        college: s.college,
        course: s.course,
        year: s.year,
        skills: s.skills,
        bio: s.bio,
        availability: s.availability,
      }))
      .filter(
        (s) => (s.full_name ?? '').trim() !== '' && (s.college ?? '').trim() !== ''
      );
    shortlistedIds = existing;
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <PinnedHeadingSection
          heading={
            <h2 className="text-2xl font-semibold tracking-tight text-[#17352b] sm:text-3xl">
              Browse Students
            </h2>
          }
        >
          <BrowseClient students={students} shortlistedIds={shortlistedIds} />
        </PinnedHeadingSection>
      </div>
    </section>
  );
}

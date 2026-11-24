/**
 * Browse Students — server component.
 * Loads only students with a completed profile AND an uploaded CV.
 * Search, availability filters and shortlist requests are client-side.
 */
import { createClient } from '@/lib/supabase/server';
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
    const [dataRes, existingRes] = await Promise.all([
      supabase
        .from('student_profiles')
        .select('id, full_name, college, course, year, skills, bio, availability, cv_path')
        .not('cv_path', 'is', null)
        .not('full_name', 'is', null)
        .not('college', 'is', null)
        .not('skills', 'eq', '{}')
        .order('updated_at', { ascending: false }),
      supabase.from('shortlists').select('student_id').eq('founder_id', user.id),
    ]);

    students = ((dataRes.data as unknown as StudentCard[]) ?? []).filter(
      (s) => (s.full_name ?? '').trim() !== '' && (s.college ?? '').trim() !== ''
    );
    shortlistedIds = (existingRes.data ?? []).map((r) => r.student_id as string);
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold tracking-tight text-[#17352b] sm:text-3xl">
          Browse Students
        </h2>
        <BrowseClient students={students} shortlistedIds={shortlistedIds} />
      </div>
    </section>
  );
}

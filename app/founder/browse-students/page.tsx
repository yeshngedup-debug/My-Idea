/**
 * Browse Students — server component.
 * Loads only students with a completed profile AND an uploaded CV.
 * Search/filter happen client-side (snappy on mobile, small data set).
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
    // Both lookups are independent — run them in one round-trip
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

    const data = dataRes.data;
    const existing = existingRes.data;

    students = ((data as unknown as StudentCard[]) ?? []).filter(
      (s) => (s.full_name ?? '').trim() !== '' && (s.college ?? '').trim() !== ''
    );

    shortlistedIds = (existing ?? []).map((r) => r.student_id as string);
  }

  return <BrowseClient students={students} shortlistedIds={shortlistedIds} />;
}

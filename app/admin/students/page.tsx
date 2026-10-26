/**
 * Admin — Students management (MVP core).
 * Ranks, verification, selection, shortlist generation for a founder/project.
 * Shell matches admin pages: mobile top bar + lg sidebar.
 */
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminStudentsClient, type AdminStudent } from './admin-students-client';

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
    // All four lookups are independent — run them in one round-trip
    const [sp, apps, f, p] = await Promise.all([
      supabase
        .from('student_profiles')
        .select(
          'id, full_name, college, course, year, skills, bio, availability, cv_path, rank, verified, contact_email'
        )
        .order('rank', { ascending: true, nullsFirst: false }),
      supabase.from('applications').select('student_id'),
      supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'founder')
        .order('full_name', { ascending: true }),
      supabase
        .from('projects')
        .select('id, title, founder_id')
        .order('created_at', { ascending: false }),
    ]);

    // Application counts per student
    const counts = new Map<string, number>();
    for (const a of apps.data ?? []) {
      counts.set(a.student_id as string, (counts.get(a.student_id as string) ?? 0) + 1);
    }

    students = ((sp.data as unknown as AdminStudent[]) ?? []).map((s) => ({
      ...s,
      applications: counts.get(s.id) ?? 0,
    }));

    founders = (f.data as { id: string; full_name: string | null }[]) ?? [];
    projects = (p.data as { id: string; title: string; founder_id: string }[]) ?? [];
  }

  return (
    <>
        <div className="hidden lg:block mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter">Students</h2>
          <p className="text-white/50 mt-1">
            Rank manually, verify profiles, then generate a shortlist for any founder or project.
          </p>
        </div>

        <AdminStudentsClient students={students} founders={founders} projects={projects} />
      </>
  );
}

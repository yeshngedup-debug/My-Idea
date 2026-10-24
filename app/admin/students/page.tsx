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
    const { data: sp } = await supabase
      .from('student_profiles')
      .select(
        'id, full_name, college, course, year, skills, bio, availability, cv_path, rank, verified, contact_email'
      )
      .order('rank', { ascending: true, nullsFirst: false });

    // Application counts per student
    const { data: apps } = await supabase
      .from('applications')
      .select('student_id');

    const counts = new Map<string, number>();
    for (const a of apps ?? []) {
      counts.set(a.student_id as string, (counts.get(a.student_id as string) ?? 0) + 1);
    }

    students = ((sp as unknown as AdminStudent[]) ?? []).map((s) => ({
      ...s,
      applications: counts.get(s.id) ?? 0,
    }));

    const { data: f } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'founder')
      .order('full_name', { ascending: true });

    founders = (f as { id: string; full_name: string | null }[]) ?? [];

    const { data: p } = await supabase
      .from('projects')
      .select('id, title, founder_id')
      .order('created_at', { ascending: false });

    projects = (p as { id: string; title: string; founder_id: string }[]) ?? [];
  }

  return (
    <div className="min-h-screen bg-[#0c0b10] text-white">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0c0b10]/90 backdrop-blur-md border-b border-white/10 px-4 h-14 flex items-center gap-3">
        <Link
          href="/admin"
          aria-label="Back to admin dashboard"
          className="p-2 -ml-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <span className="text-sm font-semibold">Back</span>
        </Link>
        <h1 className="text-base font-extrabold tracking-tight">Students</h1>
      </header>

      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white/[0.03] backdrop-blur-xl border-r border-white/10 flex-col p-6 z-30">
        <h1 className="text-lg font-extrabold tracking-tight mb-8">Students</h1>
        <Link
          href="/admin"
          className="px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          Back to dashboard
        </Link>
      </aside>

      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10 max-w-3xl mx-auto lg:max-w-none lg:mx-0">
        <div className="hidden lg:block mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter">Students</h2>
          <p className="text-white/50 mt-1">
            Rank manually, verify profiles, then generate a shortlist for any founder or project.
          </p>
        </div>

        <AdminStudentsClient students={students} founders={founders} projects={projects} />
      </main>
    </div>
  );
}

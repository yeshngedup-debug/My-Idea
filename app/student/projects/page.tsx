/**
 * Student Projects — server component.
 * Loads open projects and the student's existing applications.
 * Apply buttons live in the client component.
 */
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import {
  ProjectsClient,
  type OpenProject,
} from './projects-client';

export const metadata = { title: 'Open Projects | Bhutan Tech Connect' };

export default async function StudentProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let projects: OpenProject[] = [];
  let appliedIds: string[] = [];

  const { data: rows } = await supabase
    .from('projects')
    .select(
      'id, title, description, duration, work_mode, budget_min, budget_max, required_skills, deadline'
    )
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  projects = (rows as unknown as OpenProject[]) ?? [];

  if (user) {
    const { data: apps } = await supabase
      .from('applications')
      .select('project_id')
      .eq('student_id', user.id);

    appliedIds = (apps ?? []).map((a) => a.project_id as string);
  }

  return (
    <div className="min-h-screen bg-[#0c0b10] text-white">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0c0b10]/90 backdrop-blur-md border-b border-white/10 px-4 h-14 flex items-center gap-3">
        <Link
          href="/student"
          aria-label="Back to dashboard"
          className="p-2 -ml-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-extrabold tracking-tight">Open Projects</h1>
      </header>

      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white/[0.03] backdrop-blur-xl border-r border-white/10 flex-col p-6 z-30">
        <h1 className="text-lg font-extrabold tracking-tight mb-8">Open Projects</h1>
        <Link
          href="/student"
          className="px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          Back to dashboard
        </Link>
      </aside>

      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10 max-w-2xl mx-auto lg:max-w-none lg:mx-0">
        <div className="hidden lg:block mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter">Open Projects</h2>
          <p className="text-white/50 mt-1">Browse open projects and apply with one tap.</p>
        </div>

        <ProjectsClient projects={projects} appliedIds={appliedIds} />
      </main>
    </div>
  );
}

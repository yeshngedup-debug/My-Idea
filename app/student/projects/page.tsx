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

  // Open projects + this student's applications — one round-trip
  const [rowsRes, appsRes] = await Promise.all([
    supabase
      .from('projects')
      .select(
        'id, title, description, duration, work_mode, budget_min, budget_max, required_skills, deadline'
      )
      .eq('status', 'open')
      .order('created_at', { ascending: false }),
    supabase
      .from('applications')
      .select('project_id')
      .eq('student_id', user?.id ?? ''),
  ]);

  projects = (rowsRes.data as unknown as OpenProject[]) ?? [];

  appliedIds = (appsRes.data ?? []).map((a) => a.project_id as string);

  return (
    <>
        <div className="hidden lg:block mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter">Open Projects</h2>
          <p className="text-white/50 mt-1">Browse open projects and apply with one tap.</p>
        </div>

        <ProjectsClient projects={projects} appliedIds={appliedIds} />
      </>
  );
}

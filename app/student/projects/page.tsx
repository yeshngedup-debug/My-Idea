/**
 * Student Projects — server component.
 * Loads open projects and the student's existing applications, then hands
 * both to the interactive client cards (apply + status feedback).
 */
import { createClient } from '@/lib/supabase/server';
import { ProjectsClient, type OpenProject } from './projects-client';

export const metadata = { title: 'Open Projects | Bhutan Tech Connect' };

export default async function StudentProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let projects: OpenProject[] = [];
  let appliedIds: string[] = [];

  if (user) {
    // Open projects + this student's applications — one round-trip.
    // `created_at` is part of the OpenProject prop shape the client expects.
    const [rowsRes, appsRes] = await Promise.all([
      supabase
        .from('projects')
        .select(
          'id, title, description, duration, work_mode, budget_min, budget_max, required_skills, deadline, created_at'
        )
        .eq('status', 'open')
        .order('created_at', { ascending: false }),
      supabase
        .from('applications')
        .select('project_id')
        .eq('student_id', user.id),
    ]);

    projects = (rowsRes.data as unknown as OpenProject[]) ?? [];
    appliedIds = (appsRes.data ?? []).map((a) => a.project_id as string);
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold tracking-tight text-[#17352b] sm:text-3xl">
          Open Projects
        </h2>
        <ProjectsClient projects={projects} appliedIds={appliedIds} />
      </div>
    </section>
  );
}

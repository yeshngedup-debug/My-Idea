/**
 * Founder Project Detail — server: verify ownership, load project + applicants.
 */
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  ProjectDetailClient,
  type Applicant,
  type ProjectInfo,
} from './project-detail-client';

export const metadata = { title: 'Project Applicants | Bhutan Tech Connect' };

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: p } = await supabase
    .from('projects')
    .select('id, title, status, founder_id, budget_min, budget_max, duration, work_mode')
    .eq('id', id)
    .single();

  // Not found, or not owned by this founder.
  if (!p || (user && p.founder_id !== user.id)) notFound();

  const project: ProjectInfo = {
    id: p.id,
    title: p.title,
    status: p.status,
    budget_min: p.budget_min,
    budget_max: p.budget_max,
    duration: p.duration,
    work_mode: p.work_mode,
  };

  const { data: apps } = await supabase
    .from('applications')
    .select(
      'id, status, created_at, student_id, student:student_profiles(full_name, college, course, year, skills, availability, cv_path, contact_email)'
    )
    .eq('project_id', id)
    .order('created_at', { ascending: true });

  const applicants: Applicant[] = (apps as unknown as Applicant[]) ?? [];

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <ProjectDetailClient project={project} applicants={applicants} />
      </div>
    </section>
  );
}

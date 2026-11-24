/**
 * Founder Project Detail — server: verify ownership, load project + applicants.
 */
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProject, listProjectApplicants } from '@/lib/neon-data';
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

  const p = await getProject(id);

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

  const apps = await listProjectApplicants(id);
  const applicants: Applicant[] = apps;

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <ProjectDetailClient project={project} applicants={applicants} />
      </div>
    </section>
  );
}

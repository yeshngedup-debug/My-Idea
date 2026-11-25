/**
 * Founder Project Detail — server: verify ownership, load project + applicants.
 *
 * The session is used only to identify the caller. The project and its
 * applicants are read through typed Neon helpers; ownership is re-checked
 * against the stored founder_id before any applicant row is loaded, so a
 * non-owner gets a 404 and no data.
 */
import { notFound } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { getProject, listProjectApplicants } from '@/lib/neon-data';
import { PinnedHeadingSection } from '@/components/layout/pinned-heading-section';
import { WorkspacePageHeading } from '@/components/layout/workspace-page-heading';
import {
  ProjectDetailClient,
  type Applicant,
  type ProjectInfo,
} from './project-detail-client';

export const metadata = { title: 'Project Applicants | Bhutan Tech Connect' };

const UUID_PATH = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

async function readProject(id: string) {
  try {
    return await getProject(id);
  } catch (error) {
    console.error('Founder project detail: project read failed', error);
    throw new Error('Unable to load this project.');
  }
}

async function readApplicants(id: string) {
  try {
    return await listProjectApplicants(id);
  } catch (error) {
    console.error('Founder project detail: applicant read failed', error);
    throw new Error('Unable to load applicants.');
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_PATH.test(id)) notFound();

  const user = await getUser();

  // Fail closed: no session means no database read at all.
  if (!user) notFound();

  const p = await readProject(id);

  // Someone else's project is indistinguishable from a missing one.
  if (!p || p.founder_id !== user.id) notFound();

  const project: ProjectInfo = {
    id: p.id,
    title: p.title,
    status: p.status,
    budget_min: p.budget_min,
    budget_max: p.budget_max,
    duration: p.duration,
    work_mode: p.work_mode,
  };

  const apps = await readApplicants(id);
  const applicants: Applicant[] = apps;

  return (
    <div className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <PinnedHeadingSection
          split="lg:grid-cols-[0.3fr_0.7fr]"
          heading={
            <WorkspacePageHeading
              eyebrow="Founder workspace"
              title="Project applicants"
              description="Review applications and move candidates through your hiring steps."
            />
          }
        >
          <ProjectDetailClient project={project} applicants={applicants} />
        </PinnedHeadingSection>
      </div>
    </div>
  );
}

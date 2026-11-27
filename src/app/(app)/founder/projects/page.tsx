/**
 * My Projects — founder's posted projects list.
 *
 * Auth comes from the verified session only; every application row is read through
 * the typed Neon helper, scoped by the signed-in founder's id.
 */
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { listProjectsByFounder } from '@/lib/neon-data';
import { PinnedHeadingSection } from '@/components/layout/pinned-heading-section';
import { WorkspacePageHeading } from '@/components/layout/workspace-page-heading';
import { ProjectsClient, type FounderProjectRow } from './projects-client';

export const metadata = { title: 'My Projects' };

const PRIMARY_LINK =
  'pressable inline-flex min-h-11 items-center justify-center rounded-md bg-cta px-4 py-2 text-sm font-semibold text-cta-foreground transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const FILTER_VALUES = new Set([
  'all',
  'open',
  'in_progress',
  'review',
  'completed',
]);

export default async function MyProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] | undefined }>;
}) {
  const { status } = await searchParams;
  const rawStatus = Array.isArray(status) ? status[0] : status;
  const initialFilter =
    rawStatus && FILTER_VALUES.has(rawStatus) ? rawStatus : 'all';

  const user = await getUser();

  let projects: FounderProjectRow[] = [];
  if (user) {
    const rows = await listProjectsByFounder(user.id);
    projects = rows.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      created_at: p.created_at,
    }));
  }

  return (
    <div>
      <PinnedHeadingSection
        heading={
          <WorkspacePageHeading
            eyebrow="Founder workspace"
            title="My Projects"
            description={`${projects.length} posted. Open a brief to review its applicants.`}
          />
        }
      >
        <div className="mb-5 flex justify-start sm:justify-end">
          <Link href="/founder/projects/post" className={PRIMARY_LINK}>
            Post a project
          </Link>
        </div>

        <ProjectsClient
          key={initialFilter}
          projects={projects}
          signedIn={Boolean(user)}
          initialFilter={initialFilter}
        />
      </PinnedHeadingSection>
    </div>
  );
}

/**
 * Student Projects — server component.
 * Loads open projects, the student's existing applications and real founder
 * names, then hands them to the interactive post feed (apply + status feedback).
 */
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  listAllProjectsWithDetails,
  listProfilesByIds,
  listStudentAppliedProjectIds,
} from '@/lib/neon-data';
import { PinnedHeadingSection } from '@/components/layout/pinned-heading-section';
import { WorkspacePageHeading } from '@/components/layout/workspace-page-heading';
import { ProjectsClient, type OpenProject } from './projects-client';

export const metadata = { title: 'Open Projects' };

/** Server-computed so the relative label cannot drift between server and client. */
function postedLabel(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const minutes = Math.max(0, Math.floor((Date.now() - then) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export default async function StudentProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const initialQuery = typeof params.q === 'string' ? params.q.slice(0, 120) : '';
  const modeParam = typeof params.mode === 'string' ? params.mode : '';
  const initialMode =
    modeParam === 'remote' || modeParam === 'onsite' ? modeParam : 'all';

  const user = await getUser();

  if (!user) redirect('/login');

  // Open projects + this student's applications + real founder display names.
  // listOpenProjects() has no founder_id in its result, so the full project
  // helper is filtered to open rows. Names are fetched only for the founder
  // IDs on those open rows (parameterized SQL), never for every founder.
  // No student ID is taken from the browser — ownership is always user.id.
  const [allRows, applied] = await Promise.all([
    listAllProjectsWithDetails(),
    listStudentAppliedProjectIds(user.id),
  ]);
  const openRows = allRows.filter((row) => row.status === 'open');
  // Defensive de-duplication: React keys are project IDs, so an unexpected
  // duplicate row must never render the same brief twice.
  const rows = [...new Map(openRows.map((row) => [row.id, row])).values()];

  const founderIds = [...new Set(rows.map((row) => row.founder_id))];
  const founders = await listProfilesByIds(founderIds);
  const founderNames = new Map(
    founders
      .filter((f) => f.full_name)
      .map((f) => [f.id, f.full_name as string]),
  );

  const projects: OpenProject[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    required_skills: row.required_skills,
    duration: row.duration,
    budget_min: row.budget_min,
    budget_max: row.budget_max,
    work_mode: row.work_mode,
    deadline: row.deadline,
    created_at: row.created_at,
    status: row.status,
    founderName: founderNames.get(row.founder_id) ?? null,
    postedLabel: postedLabel(row.created_at),
  }));
  const appliedIds = applied;

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <PinnedHeadingSection
          heading={
            <WorkspacePageHeading
              eyebrow="Student workspace"
              title="Open Projects"
              description="Paid briefs posted by founders. Check the scope and deadline before you apply."
            />
          }
          split="lg:grid-cols-[0.2fr_0.8fr]"
        >
          <ProjectsClient
            projects={projects}
            appliedIds={appliedIds}
            initialQuery={initialQuery}
            initialMode={initialMode}
          />
        </PinnedHeadingSection>
      </div>
    </section>
  );
}

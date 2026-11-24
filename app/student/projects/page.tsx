/**
 * Student Projects — server component.
 * Loads open projects, the student's existing applications and real founder
 * names, then hands them to the interactive post feed (apply + status feedback).
 */
import { createClient } from '@/lib/supabase/server';
import {
  listAllProjectsWithDetails,
  listFounderProfiles,
  listStudentAppliedProjectIds,
} from '@/lib/neon-data';
import { PinnedHeadingSection } from '@/components/layout/pinned-heading-section';
import { WorkspacePageHeading } from '@/components/layout/workspace-page-heading';
import { ProjectsClient, type OpenProject } from './projects-client';

export const metadata = { title: 'Open Projects | Bhutan Tech Connect' };

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

export default async function StudentProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let projects: OpenProject[] = [];
  let appliedIds: string[] = [];

  if (user) {
    // Open projects + this student's applications + real founder display names.
    // listOpenProjects() has no founder_id in its result, so the full project
    // helper is filtered to open rows; names come from listFounderProfiles().
    // No student ID is taken from the browser — ownership is always user.id.
    const [allRows, applied, founders] = await Promise.all([
      listAllProjectsWithDetails(),
      listStudentAppliedProjectIds(user.id),
      listFounderProfiles(),
    ]);
    const rows = allRows.filter((row) => row.status === 'open');

    const founderNames = new Map(
      founders
        .filter((f) => f.full_name)
        .map((f) => [f.id, f.full_name as string]),
    );

    projects = rows.map((row) => ({
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
    appliedIds = applied;
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <PinnedHeadingSection
          heading={
            <WorkspacePageHeading
              eyebrow="Student workspace"
              title="Open Projects"
              description="Paid briefs you can apply to, posted by founders."
            />
          }
          split="lg:grid-cols-[0.2fr_0.8fr]"
        >
          <ProjectsClient projects={projects} appliedIds={appliedIds} />
        </PinnedHeadingSection>
      </div>
    </section>
  );
}

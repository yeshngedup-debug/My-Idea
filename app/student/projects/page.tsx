/**
 * Student Projects — server component.
 * Loads open projects and the student's existing applications, then hands
 * both to the interactive client cards (apply + status feedback).
 */
import { createClient } from '@/lib/supabase/server';
import { listOpenProjects, listStudentAppliedProjectIds } from '@/lib/neon-data';
import { PinnedHeadingSection } from '@/components/layout/pinned-heading-section';
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
    const [rows, applied] = await Promise.all([
      listOpenProjects(),
      listStudentAppliedProjectIds(user.id),
    ]);

    projects = rows as OpenProject[];
    appliedIds = applied;
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <PinnedHeadingSection
          heading={
            <h2 className="text-2xl font-semibold tracking-tight text-[#17352b] sm:text-3xl">
              Open Projects
            </h2>
          }
          split="lg:grid-cols-[0.2fr_0.8fr]"
        >
          <ProjectsClient projects={projects} appliedIds={appliedIds} />
        </PinnedHeadingSection>
      </div>
    </section>
  );
}

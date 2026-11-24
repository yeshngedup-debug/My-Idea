/**
 * Admin — Projects: a real list of all project postings with a status filter.
 */
import { listAllProjectsWithDetails, listProfilesByIds } from "@/lib/neon-data";
import { PinnedHeadingSection } from "@/components/layout/pinned-heading-section";
import { ProjectsClient, type ProjectRow } from "./projects-client";

export const metadata = { title: "Projects | Admin | Bhutan Tech Connect" };

export default async function AdminProjectsPage() {
  const projects = await listAllProjectsWithDetails();

  const rows: ProjectRow[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    created_at: p.created_at,
    founder_id: p.founder_id,
  }));

  const founderIds = [...new Set(rows.map((r) => r.founder_id))];
  if (founderIds.length > 0) {
    const fp = await listProfilesByIds(founderIds);
    const names = new Map(fp.map((f) => [f.id, f.full_name]));
    rows.forEach((r) => {
      r.founderName = names.get(r.founder_id) ?? null;
    });
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <PinnedHeadingSection
          heading={
            <h2 className="text-2xl font-semibold tracking-tight text-[#17352b] sm:text-3xl">
              Projects
            </h2>
          }
        >
          <ProjectsClient rows={rows} />
        </PinnedHeadingSection>
      </div>
    </section>
  );
}

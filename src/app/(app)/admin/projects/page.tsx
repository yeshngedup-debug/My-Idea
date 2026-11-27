/**
 * Admin — Projects: a real list of all project postings with a status filter.
 * The session identifies the caller; all table reads use typed Neon helpers.
 * Admin access is re-checked server-side here, not only in the proxy.
 */
import { redirect } from "next/navigation";
import { getUser } from '@/lib/auth';
import {
  getProfileRole,
  listAllProjectsWithDetails,
  listProfilesByIds,
  type Role,
} from "@/lib/neon-data";
import { PinnedHeadingSection } from "@/components/layout/pinned-heading-section";
import { WorkspacePageHeading } from "@/components/layout/workspace-page-heading";
import { ProjectsClient, type ProjectRow } from "./projects-client";

export const metadata = { title: "Projects | Admin" };

// Reads the session via cookies(), so it can only be rendered on demand.
export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  let rows: ProjectRow[] = [];
  let loadError: string | null = null;

  let user = null;
  try {
    user = await getUser();
  } catch (error) {
    console.error("[admin/projects] Failed to verify session", error);
    loadError = "Could not verify your session. Try again.";
  }

  if (!loadError) {
    if (!user) redirect("/login");

    let role: Role | null = null;
    let roleLookupFailed = false;
    try {
      role = await getProfileRole(user.id);
    } catch (error) {
      roleLookupFailed = true;
      console.error("[admin/projects] Failed to verify role", error);
      loadError = "Could not verify your access. Try again.";
    }

    if (!roleLookupFailed && role !== "admin") {
      redirect(role === "founder" ? "/founder" : "/student");
    }

    if (!loadError) {
      try {
        const projects = await listAllProjectsWithDetails();
        const founderIds = [...new Set(projects.map((p) => p.founder_id))];
        const founders =
          founderIds.length > 0 ? await listProfilesByIds(founderIds) : [];
        const names = new Map(founders.map((f) => [f.id, f.full_name]));

        rows = projects.map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          created_at: p.created_at,
          founder_id: p.founder_id,
          founderName: names.get(p.founder_id) ?? null,
        }));
      } catch (error) {
        console.error("[admin/projects] Failed to load projects", error);
        rows = [];
        loadError = "Could not load projects. Try again.";
      }
    }
  }

  return (
    <section>
      <div className="mx-auto max-w-5xl">
        <PinnedHeadingSection
          heading={
            <WorkspacePageHeading
              eyebrow="Admin workspace"
              title="Projects"
              description="Every posted brief, with its current review stage."
            />
          }
        >
          <ProjectsClient rows={rows} loadError={loadError} />
        </PinnedHeadingSection>
      </div>
    </section>
  );
}

/**
 * Founder Dashboard — post project, recent projects, workspace shortcuts.
 */
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listProjectsByFounder } from "@/lib/neon-data";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { WorkspaceStats } from "@/components/layout/workspace-stats";
import { Badge } from "@/components/ui/badge";
import {
  HoverLift,
  Reveal,
  StaggerGroup,
  StaggerItem,
} from "@/components/ui/motion";

export const metadata = { title: "Founder Dashboard | Bhutan Tech Connect" };

export default async function FounderDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let projects: {
    id: string;
    title: string;
    status: string;
    created_at: string;
  }[] = [];

  if (user) {
    const rows = await listProjectsByFounder(user.id);
    projects = rows.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      created_at: p.created_at,
    }));
  }

  const openProjects = projects.filter(
    (project) => project.status === "open",
  ).length;
  const inProgressProjects = projects.filter(
    (project) => project.status === "in_progress",
  ).length;

  const stats = [
    { label: "Projects posted", value: projects.length, detail: null },
    { label: "Open projects", value: openProjects, detail: null },
    { label: "In progress", value: inProgressProjects, detail: null },
  ];

  return (
    <div className="space-y-8">
      <Reveal>
        <WorkspaceHero
          eyebrow="Founder workspace"
          title="Projects and people"
          description="Post a brief, review who applies, and unlock a shortlist when you are ready."
        >
          <Link
            href="/founder/projects/post"
            className="pressable inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-300 px-5 py-3 text-sm font-semibold text-[#17352b] transition-colors hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#17352b]"
          >
            Post a project
          </Link>
        </WorkspaceHero>
      </Reveal>

      <Reveal>
        <WorkspaceStats stats={stats} />
      </Reveal>

      <section className="grid grid-cols-12 gap-6 lg:gap-8">
        <div className="col-span-12 min-w-0 lg:col-span-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight text-[#17352b]">
              Recent projects
            </h2>
            {projects.length > 0 && (
              <Link
                href="/founder/projects"
                className="inline-flex shrink-0 items-center text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
              >
                View all
              </Link>
            )}
          </div>
          {projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#ded8cb] bg-[#fffefa] px-6 py-10">
              <h3 className="text-base font-semibold text-[#17352b]">
                Post a brief to meet students
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#657069]">
                A clear scope and budget help students understand where they can
                contribute.
              </p>
              <Link
                href="/founder/projects/post"
                className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
              >
                Create your first project
              </Link>
            </div>
          ) : (
            <StaggerGroup className="divide-y divide-[#ded8cb] border-y border-[#ded8cb]">
              {projects.slice(0, 5).map((project) => (
                <StaggerItem key={project.id}>
                  <HoverLift>
                    <Link
                      href={`/founder/projects/${project.id}`}
                      className="group flex min-w-0 items-center justify-between gap-4 py-3.5 transition-colors hover:bg-[#f5f2ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-[#17352b]">
                          {project.title}
                        </span>
                        <span className="mt-0.5 block text-xs tabular-nums text-[#657069]">
                          Posted{" "}
                          {new Date(project.created_at).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short" },
                          )}
                        </span>
                      </span>
                      <Badge className="shrink-0 gap-1.5 border-[#ded8cb] bg-[#f5f2ea] text-[#17352b]">
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 rounded-full bg-[#17352b]"
                        />
                        {project.status === "in_progress"
                          ? "In progress"
                          : project.status.charAt(0).toUpperCase() +
                            project.status.slice(1)}
                      </Badge>
                    </Link>
                  </HoverLift>
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>

        <div className="col-span-12 min-w-0 lg:col-span-4">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#17352b]">
            Go to
          </h2>
          <nav aria-label="Founder shortcuts" className="workspace-paper divide-y divide-[#ded8cb] border-y border-[#ded8cb]">
            {[
              { href: "/founder/browse-students", title: "Find talent", description: "Browse verified student profiles" },
              { href: "/founder/projects", title: "Projects", description: "Manage your briefs and applicants" },
              { href: "/founder/shortlists", title: "Shortlists", description: "Track payment and unlock a list" },
            ].map((item) => (
              <HoverLift key={item.href}>
                <Link
                  href={item.href}
                  className="flex flex-col gap-0.5 py-3.5 text-sm font-medium text-[#17352b] transition-colors hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
                >
                  {item.title}
                  <span className="text-xs font-normal text-[#657069]">
                    {item.description}
                  </span>
                </Link>
              </HoverLift>
            ))}
          </nav>
        </div>
      </section>
    </div>
  );
}

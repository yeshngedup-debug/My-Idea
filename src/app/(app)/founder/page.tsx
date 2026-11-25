/**
 * Founder Dashboard — post project, recent projects, workspace shortcuts.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from '@/lib/auth';
import { getProfileRole, listProjectsByFounder } from "@/lib/neon-data";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { WorkspaceStats } from "@/components/layout/workspace-stats";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Founder Dashboard" };

const BHUTAN_TZ = "Asia/Thimphu";

/** Render dates in Bhutan time, adding the year for projects from other years. */
function formatPostedDate(iso: string): string {
  const date = new Date(iso);
  const yearFormatter = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    timeZone: BHUTAN_TZ,
  });
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    timeZone: BHUTAN_TZ,
  };
  if (yearFormatter.format(date) !== yearFormatter.format(new Date())) {
    options.year = "numeric";
  }
  return new Intl.DateTimeFormat("en-GB", options).format(date);
}

export default async function FounderDashboard() {
  const user = await getUser();

  if (!user) redirect("/login");

  // Identity comes from the session, and the role is re-read from the database
  // on every request — the same check the other founder pages perform.
  const role = await getProfileRole(user.id);
  if (role !== "founder") redirect("/");

  const rows = await listProjectsByFounder(user.id);
  const projects = rows.map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    created_at: p.created_at,
  }));

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
      <WorkspaceHero
        eyebrow="Founder workspace"
        title="Projects and people"
        description="Post a brief, review who applies, and request a shortlist when you are ready."
      >
        <Link
          href="/founder/projects/post"
          className="pressable inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-300 px-5 py-3 text-sm font-semibold text-[#17352b] transition-colors hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#17352b]"
        >
          Post a project
        </Link>
      </WorkspaceHero>

      <WorkspaceStats stats={stats} />

      <section className="grid grid-cols-12 gap-6 lg:gap-8">
        <div className="col-span-12 min-w-0 lg:col-span-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight text-[#17352b]">
              Recent projects
            </h2>
            {projects.length > 0 && (
              <Link
                href="/founder/projects"
                className="inline-flex min-h-11 shrink-0 items-center rounded text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
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
                className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
              >
                Create your first project
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#ded8cb] border-y border-[#ded8cb]">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id}>
                  <Link
                    href={`/founder/projects/${project.id}`}
                    className="group flex min-w-0 items-center justify-between gap-4 py-3.5 transition-colors hover:bg-[#f5f2ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-[#17352b]">
                        {project.title}
                      </span>
                      <span className="mt-0.5 block text-xs tabular-nums text-[#657069]">
                        Posted {formatPostedDate(project.created_at)}
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
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-12 min-w-0 lg:col-span-4">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#17352b]">
            Go to
          </h2>
          <nav aria-label="Founder shortcuts" className="workspace-paper divide-y divide-[#ded8cb] border-y border-[#ded8cb]">
            {[
              { href: "/founder/browse-students", title: "Find talent", description: "Browse student profiles with CVs" },
              { href: "/founder/projects", title: "Projects", description: "Manage your briefs and applicants" },
              { href: "/founder/shortlists", title: "Shortlists", description: "Track payment and shortlist progress" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col gap-0.5 py-3.5 text-sm font-medium text-[#17352b] transition-colors hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
              >
                {item.title}
                <span className="text-xs font-normal text-[#657069]">
                  {item.description}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </div>
  );
}

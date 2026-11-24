/**
 * Founder Dashboard — welcome, post project, recent projects.
 */
import Link from "next/link";
import { BriefcaseBusiness, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile, listProjectsByFounder } from "@/lib/neon-data";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
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

  let name = "Founder";
  let projects: {
    id: string;
    title: string;
    status: string;
    created_at: string;
  }[] = [];

  if (user) {
    const [profile, rows] = await Promise.all([
      getProfile(user.id),
      listProjectsByFounder(user.id),
    ]);

    name = profile?.full_name ?? name;
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

  return (
    <div className="space-y-8">
      <Reveal>
        <WorkspaceHero
          eyebrow="Founder workspace"
          title={`Good to see you, ${name.split(" ")[0]}.`}
          description="Post work. Meet students."
        >
          <Link
            href="/founder/projects/post"
            className="pressable inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-bold text-[#17352b] transition-colors hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#17352b]"
          >
            <Plus aria-hidden="true" className="h-4 w-4" /> Post a project
          </Link>
        </WorkspaceHero>
      </Reveal>

      <Reveal>
        <dl className="border-t border-[#17352b]/10">
          {[
            { label: "Projects posted", value: projects.length },
            { label: "Open projects", value: openProjects },
            { label: "In progress", value: inProgressProjects },
          ].map(({ label, value }, index) => (
            <div
              key={label}
              className="flex min-w-0 items-baseline justify-between gap-x-4 border-b border-[#17352b]/10 py-4"
            >
              <dt className="text-sm text-[#657069]">{label}</dt>
              <dd
                className={`tabular-nums tracking-tight text-[#17352b] ${
                  index === 0 ? "text-3xl font-semibold" : "text-xl font-medium"
                }`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <section>
        <Reveal>
          <div className="mb-4 flex items-end justify-between gap-4">
            <h3 className="text-lg font-semibold tracking-tight text-[#17352b]">
              Recent projects
            </h3>
            {projects.length > 0 && (
              <Link
                href="/founder/projects"
                className="inline-flex items-center text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
              >
                View all
              </Link>
            )}
          </div>
        </Reveal>
        {projects.length === 0 ? (
          <Reveal>
            <div className="rounded-2xl border border-dashed border-[#ded8cb] bg-[#fffefa] px-6 py-10 text-center">
              <BriefcaseBusiness
                aria-hidden="true"
                className="mx-auto h-8 w-8 text-[#8d948e]"
              />
              <h4 className="mt-3 font-semibold text-[#17352b]">
                Post a brief to meet students
              </h4>
              <p className="mt-1 text-sm text-[#657069]">
                A clear scope and budget help students understand where they can
                contribute.
              </p>
              <Link
                href="/founder/projects/post"
                className="mt-5 inline-flex min-h-10 items-center text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
              >
                Create your first project
              </Link>
            </div>
          </Reveal>
        ) : (
          <StaggerGroup className="space-y-2.5">
            {projects.slice(0, 5).map((project) => (
              <StaggerItem key={project.id}>
                <HoverLift>
                  <Link
                    href={`/founder/projects/${project.id}`}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3.5 transition-colors duration-150 hover:border-[#17352b]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#17352b]">
                        {project.title}
                      </p>
                      <p className="mt-1 text-xs text-[#657069]">
                        Posted{" "}
                        {new Date(project.created_at).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short" },
                        )}
                      </p>
                    </div>
                    <Badge className="shrink-0 capitalize border-[#ded8cb] bg-[#f5f2ea] text-[#17352b]">
                      {project.status.replace("_", " ")}
                    </Badge>
                  </Link>
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </section>
    </div>
  );
}

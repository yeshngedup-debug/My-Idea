/**
 * Founder Dashboard — welcome, post project, recent projects.
 */
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CircleCheck,
  Plus,
  Rocket,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
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
    const [profRes, projRes] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).single(),
      supabase
        .from("projects")
        .select("id, title, status, created_at")
        .eq("founder_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    name =
      (profRes.data as { full_name: string | null } | null)?.full_name ?? name;
    projects = (projRes.data as typeof projects) ?? [];
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

      <StaggerGroup className="grid grid-flow-dense grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[#17352b]/10 bg-[#17352b]/10 sm:grid-cols-3">
        {[
          { label: "Projects posted", value: projects.length, icon: BriefcaseBusiness },
          { label: "Open projects", value: openProjects, icon: Rocket },
          { label: "In progress", value: inProgressProjects, icon: CircleCheck },
        ].map(({ label, value, icon: Icon }) => (
          <StaggerItem key={label} className="bg-[#fffefa]">
            <div className="flex items-start justify-between gap-3 p-5">
              <div>
                <p className="text-xs font-medium text-[#657069]">{label}</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-[#17352b]">
                  {value}
                </p>
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#17352b]/6 text-[#17352b]">
                <Icon aria-hidden="true" className="h-4.5 w-4.5" />
              </span>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <section>
        <Reveal>
          <div className="mb-4 flex items-end justify-between gap-4">
            <h3 className="text-lg font-semibold tracking-tight text-[#17352b]">
              Recent projects
            </h3>
            {projects.length > 0 && (
              <Link
                href="/founder/projects"
                className="group inline-flex items-center gap-1 text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
              >
                View all
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-[1.01] motion-reduce:transform-none"
                />
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
                className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
              >
                Create your first project <ArrowRight aria-hidden="true" className="h-4 w-4" />
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

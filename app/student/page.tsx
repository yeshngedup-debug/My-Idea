/**
 * Student Dashboard — welcome, browse projects, recent applications.
 */
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  UserRound,
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

export const metadata = { title: "Student Dashboard | Bhutan Tech Connect" };

export default async function StudentDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name = "Student";
  let applications: {
    id: string;
    status: string;
    created_at: string;
    project: { title: string } | null;
  }[] = [];

  if (user) {
    const [appsRes, profRes] = await Promise.all([
      supabase
        .from("applications")
        .select("id, status, created_at, project:projects(title)")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("student_profiles")
        .select("full_name")
        .eq("id", user.id)
        .single(),
    ]);

    applications = (appsRes.data as unknown as typeof applications) ?? [];
    name =
      (profRes.data as { full_name: string | null } | null)?.full_name ??
      user.user_metadata?.full_name ??
      name;
  }

  const awaitingResponse = applications.filter(
    (application) => application.status === "pending",
  ).length;
  const acceptedApplications = applications.filter(
    (application) => application.status === "accepted",
  ).length;

  return (
    <div className="space-y-8">
      <Reveal>
        <WorkspaceHero
          eyebrow="Student workspace"
          title={`Welcome back, ${name.split(" ")[0]}.`}
          description="Find work that fits your skills."
        >
          <Link
            href="/student/projects"
            className="pressable inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-bold text-[#17352b] transition-colors hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#17352b]"
          >
            Browse projects <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link
            href="/student/profile"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/35 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <UserRound aria-hidden="true" className="h-4 w-4" /> Update profile
          </Link>
        </WorkspaceHero>
      </Reveal>

      <StaggerGroup className="grid grid-flow-dense grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[#17352b]/10 bg-[#17352b]/10 sm:grid-cols-3">
        {[
          { label: "Applications sent", value: applications.length, icon: BriefcaseBusiness },
          { label: "Awaiting response", value: awaitingResponse, icon: Clock3 },
          { label: "Accepted", value: acceptedApplications, icon: CheckCircle2 },
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
              Recent applications
            </h3>
            {applications.length > 0 && (
              <Link
                href="/student/applications"
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
        {applications.length === 0 ? (
          <Reveal>
            <div className="rounded-2xl border border-dashed border-[#ded8cb] bg-[#fffefa] px-6 py-10 text-center">
              <BriefcaseBusiness
                aria-hidden="true"
                className="mx-auto h-8 w-8 text-[#8d948e]"
              />
              <h4 className="mt-3 font-semibold text-[#17352b]">
                Your next opportunity is waiting
              </h4>
              <p className="mt-1 text-sm text-[#657069]">
                Explore open projects and apply when one feels right.
              </p>
              <Link
                href="/student/projects"
                className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
              >
                Browse open projects <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        ) : (
          <StaggerGroup className="space-y-2.5">
            {applications.slice(0, 5).map((application) => (
              <StaggerItem key={application.id}>
                <HoverLift>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3.5 transition-colors duration-150 hover:border-[#17352b]/25">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#17352b]">
                        {application.project?.title ?? "Project"}
                      </p>
                      <p className="mt-1 text-xs text-[#657069]">
                        Applied{" "}
                        {new Date(application.created_at).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short" },
                        )}
                      </p>
                    </div>
                    <Badge
                      className={`shrink-0 capitalize ${application.status === "accepted" ? "border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]" : application.status === "rejected" ? "border-[#b23c26]/25 bg-[#b23c26]/8 text-[#b23c26]" : "border-amber-200 bg-amber-50 text-[#8a5a00]"}`}
                    >
                      {application.status}
                    </Badge>
                  </div>
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </section>
    </div>
  );
}

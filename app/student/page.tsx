/**
 * Student Dashboard — welcome, browse projects, recent applications.
 */
import Link from "next/link";
import { BriefcaseBusiness, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listStudentApplications, getStudentProfile } from "@/lib/neon-data";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { Badge } from "@/components/ui/badge";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/motion";

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
    const [appRows, studentProfile] = await Promise.all([
      listStudentApplications(user.id),
      getStudentProfile(user.id),
    ]);

    applications = appRows.map((a) => ({
      id: a.id,
      status: a.status,
      created_at: a.created_at,
      project: a.project,
    }));
    name =
      studentProfile?.full_name ??
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
            Browse projects
          </Link>
          <Link
            href="/student/profile"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/35 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <UserRound aria-hidden="true" className="h-4 w-4" /> Update profile
          </Link>
        </WorkspaceHero>
      </Reveal>

      <Reveal>
        <dl className="border-t border-[#17352b]/10">
          {[
            { label: "Applications sent", value: applications.length },
            { label: "Awaiting response", value: awaitingResponse },
            { label: "Accepted", value: acceptedApplications },
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
              Recent applications
            </h3>
            {applications.length > 0 && (
              <Link
                href="/student/applications"
                className="inline-flex items-center text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
              >
                View all
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
                className="mt-5 inline-flex min-h-10 items-center text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
              >
                Browse open projects
              </Link>
            </div>
          </Reveal>
        ) : (
          <StaggerGroup className="space-y-2.5">
            {applications.slice(0, 5).map((application) => (
              <StaggerItem key={application.id}>
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
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </section>
    </div>
  );
}

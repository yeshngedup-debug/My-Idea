/**
 * Student Dashboard — applications health, recent applications, shortcuts.
 */
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listStudentApplications } from "@/lib/neon-data";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { WorkspaceStats } from "@/components/layout/workspace-stats";
import { Badge } from "@/components/ui/badge";
import {
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

  let applications: {
    id: string;
    status: string;
    created_at: string;
    project: { title: string } | null;
  }[] = [];

  if (user) {
    const appRows = await listStudentApplications(user.id);
    applications = appRows.map((a) => ({
      id: a.id,
      status: a.status,
      created_at: a.created_at,
      project: a.project,
    }));
  }

  const awaitingResponse = applications.filter(
    (application) => application.status === "pending",
  ).length;
  const acceptedApplications = applications.filter(
    (application) => application.status === "accepted",
  ).length;

  const stats = [
    { label: "Applications sent", value: applications.length, detail: null },
    { label: "Awaiting response", value: awaitingResponse, detail: null },
    { label: "Accepted", value: acceptedApplications, detail: null },
  ];

  const statusLabel = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="space-y-8">
      <Reveal>
        <WorkspaceHero
          eyebrow="Student workspace"
          title="Projects and applications"
          description="Find paid work that fits your skills and track where you stand."
        >
          <Link
            href="/student/projects"
            className="pressable inline-flex min-h-11 items-center rounded-lg bg-amber-300 px-5 py-3 text-sm font-semibold text-[#17352b] transition-colors hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#17352b]"
          >
            Browse projects
          </Link>
          <Link
            href="/student/profile"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/35 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            Update profile
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
              Recent applications
            </h2>
            {applications.length > 0 && (
              <Link
                href="/student/applications"
                className="inline-flex shrink-0 items-center text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
              >
                View all
              </Link>
            )}
          </div>
          {applications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#ded8cb] bg-[#fffefa] px-6 py-10">
              <h3 className="text-base font-semibold text-[#17352b]">
                Your next opportunity is waiting
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#657069]">
                Explore open projects and apply when one feels right.
              </p>
              <Link
                href="/student/projects"
                className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
              >
                Browse open projects
              </Link>
            </div>
          ) : (
            <StaggerGroup className="divide-y divide-[#ded8cb] border-y border-[#ded8cb]">
              {applications.slice(0, 5).map((application) => (
                <StaggerItem key={application.id}>
                  <Link
                    href="/student/applications"
                    className="flex min-w-0 items-center justify-between gap-4 py-3.5 transition-colors hover:bg-[#f5f2ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-[#17352b]">
                        {application.project?.title ?? "Project"}
                      </span>
                      <span className="mt-0.5 block text-xs tabular-nums text-[#657069]">
                        Applied{" "}
                        {new Date(application.created_at).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short" },
                        )}
                      </span>
                    </span>
                    <Badge className="shrink-0 gap-1.5 border-[#ded8cb] bg-[#f5f2ea] text-[#17352b]">
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 rounded-full ${
                          application.status === "accepted"
                            ? "bg-[#17352b]"
                            : application.status === "rejected"
                              ? "bg-[#b23c26]"
                              : "bg-[#b08947]"
                        }`}
                      />
                      {statusLabel(application.status)}
                    </Badge>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>

        <div className="col-span-12 min-w-0 lg:col-span-4">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#17352b]">
            Go to
          </h2>
          <nav aria-label="Student shortcuts" className="workspace-paper divide-y divide-[#ded8cb] border-y border-[#ded8cb]">
            {[
              { href: "/student/projects", title: "Projects", description: "Open briefs you can apply to" },
              { href: "/student/applications", title: "Applications", description: "Track where each one stands" },
              { href: "/student/profile", title: "Profile", description: "Keep your details and CV current" },
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

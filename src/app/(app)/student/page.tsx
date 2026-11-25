/**
 * Student Dashboard: applications health, recent applications, shortcuts.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from '@/lib/auth';
import {
  getProfileRole,
  listStudentApplications,
  type Role,
} from "@/lib/neon-data";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { WorkspaceStats } from "@/components/layout/workspace-stats";
import { Badge } from "@/components/ui/badge";
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from "@/components/ui/motion";

export const metadata = { title: "Student Dashboard | Bhutan Tech Connect" };

const BHUTAN_TIME_ZONE = "Asia/Thimphu";

// Keep in sync with the applications list allow-list at
// app/student/applications/page.tsx:17-23 and
// app/student/applications/applications-client.tsx:27-35.
const APPLICATION_FILTER_VALUES = new Set([
  "all",
  "pending",
  "shortlisted",
  "accepted",
  "rejected",
]);

const ROLE_HOME: Partial<Record<Role, string>> = {
  founder: "/founder",
  admin: "/admin",
};

function WorkspaceNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section
      aria-labelledby="student-notice-title"
      className="rounded-2xl border border-[#ded8cb] bg-[#fffefa] px-6 py-10 sm:px-9"
    >
      <h1
        id="student-notice-title"
        className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-[#17352b] text-balance"
      >
        {title}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[#657069] sm:text-base">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {/* A full reload, not a cached client transition, retries this server render. */}
        <a
          href="/student"
          className="inline-flex min-h-11 items-center rounded-lg bg-[#17352b] px-5 py-3 text-sm font-semibold text-[#fffefa] transition-colors hover:bg-[#244b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2"
        >
          Try again
        </a>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-lg border border-[#ded8cb] px-5 py-3 text-sm font-medium text-[#17352b] transition-colors hover:bg-[#f5f2ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
        >
          Go to home
        </Link>
      </div>
    </section>
  );
}

function formatAppliedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "date unavailable";

  const yearFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: BHUTAN_TIME_ZONE,
    year: "numeric",
  });
  const sameYear =
    yearFormatter.format(date) === yearFormatter.format(new Date());

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: BHUTAN_TIME_ZONE,
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(date);
}

export default async function StudentDashboard() {
  const user = await getUser();

  if (!user) redirect("/login");

  // Identity and role come from the verified session and Neon, never from a
  // URL param. The proxy checks the same rule; this is defense in depth for
  // the data read below.
  let role: Role | null;
  try {
    role = await getProfileRole(user.id);
  } catch {
    return (
      <WorkspaceNotice
        title="We could not check your account"
        description="Your account details are not available right now. Try again in a moment."
      />
    );
  }

  if (role && role !== "student") {
    redirect(ROLE_HOME[role] ?? "/");
  }

  if (!role) {
    return (
      <WorkspaceNotice
        title="Finish setting up your account"
        description="Your account is not linked to a student profile yet. Try again after your profile is ready."
      />
    );
  }

  let applications: {
    id: string;
    status: string;
    created_at: string;
    project: { title: string } | null;
  }[];
  try {
    const appRows = await listStudentApplications(user.id);
    applications = appRows.map((a) => ({
      id: a.id,
      status: a.status,
      created_at: a.created_at,
      project: a.project,
    }));
  } catch {
    return (
      <WorkspaceNotice
        title="We could not load your applications"
        description="Your applications are not available right now. Try again in a moment."
      />
    );
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
            <h2 className="min-w-0 text-lg font-semibold tracking-tight text-[#17352b]">
              Recent applications
            </h2>
            {applications.length > 0 && (
              <Link
                href="/student/applications"
                className="inline-flex min-h-11 shrink-0 items-center rounded text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
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
                className="mt-4 inline-flex min-h-11 items-center rounded text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
              >
                Browse open projects
              </Link>
            </div>
          ) : (
            <StaggerGroup className="divide-y divide-[#ded8cb] border-y border-[#ded8cb]">
              {applications.slice(0, 5).map((application) => (
                <StaggerItem key={application.id}>
                  <Link
                    href={
                      APPLICATION_FILTER_VALUES.has(application.status)
                        ? `/student/applications?status=${application.status}`
                        : "/student/applications"
                    }
                    className="flex min-w-0 items-center justify-between gap-4 py-3.5 transition-colors hover:bg-[#f5f2ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-[#17352b]">
                        {application.project?.title ?? "Project"}
                      </span>
                      <span className="mt-0.5 block text-xs tabular-nums text-[#657069]">
                        Applied {formatAppliedDate(application.created_at)}
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

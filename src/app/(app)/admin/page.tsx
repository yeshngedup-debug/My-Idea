/**
 * Admin Dashboard — platform overview stats and recent payment orders.
 *
 * Server-only: every number on this page comes from a typed Neon helper and
 * the visuals in ./admin-charts derive from the same rows. No client motion
 * wrapper is used here, so the page hydrates no JS and its figures are always
 * present (including in reduced-motion mode and full-page captures).
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from '@/lib/auth';
import {
  getProfileRole,
  listRoleCounts,
  listProjectStatuses,
  listAllProjectsWithDetails,
  listOrders,
} from "@/lib/neon-data";
import { WorkspaceStats } from "@/components/layout/workspace-stats";
import { Badge } from "@/components/ui/badge";
import { PhotoCredit } from "@/components/ui/photo-credit";
import {
  AdminChartDefs,
  RoleDonut,
  ProjectStageBars,
  ActivityTrend,
} from "./admin-charts";

export const metadata = { title: "Admin Dashboard" };

/** Defense in depth: proxy.ts protects the route, the page re-checks the role. */
async function requireAdminPage(): Promise<void> {
  const user = await getUser();
  if (!user) redirect("/login");

  // A failed role lookup must fail the render, never fall back to a role.
  const role = await getProfileRole(user.id);
  if (role !== "admin") redirect("/");
}

export default async function AdminDashboard() {
  await requireAdminPage();

  const overview = await Promise.all([
    listRoleCounts(),
    listProjectStatuses(),
    listAllProjectsWithDetails(),
    listOrders(),
  ]).then(
    ([profileCounts, projectStatuses, projectRows, allOrders]) => ({
      ok: true as const,
      profileCounts,
      projectStatuses,
      projectRows,
      allOrders,
    }),
    (error: unknown) => ({ ok: false as const, error }),
  );

  if (!overview.ok) {
    // Logged on the server; the admin gets a retryable message, not a stack.
    console.error("[admin] Failed to load platform overview", overview.error);
    return (
      <section
        aria-label="Platform overview unavailable"
        className="rounded-2xl border border-[#b23c26]/25 bg-[#b23c26]/8 px-6 py-10"
      >
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-[#17352b] text-balance">
          Platform overview
        </h1>
        <p role="alert" className="mt-3 max-w-lg text-sm leading-6 text-[#4c5a52]">
          Could not load platform overview. Try again in a moment.
        </p>
        <a
          href="/admin"
          className="mt-4 inline-flex min-h-9 items-center rounded border border-[#ded8cb] px-4 text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
        >
          Try again
        </a>
      </section>
    );
  }

  const { profileCounts, projectStatuses, projectRows, allOrders } = overview;
  const countByRole = (role: string) =>
    profileCounts.find((row) => row.role === role)?.count ?? 0;
  const students = countByRole("student");
  const founders = countByRole("founder");
  const admins = countByRole("admin");
  const otherMembers = profileCounts
    .filter(
      (row) =>
        row.role !== "student" &&
        row.role !== "founder" &&
        row.role !== "admin",
    )
    .reduce((sum, row) => sum + Math.max(0, row.count), 0);
  const totalUsers = profileCounts.reduce(
    (sum, row) => sum + Math.max(0, row.count),
    0,
  );
  const memberBreakdown = [
    `${founders} founders`,
    `${students} students`,
    ...(admins > 0 ? [`${admins} admins`] : []),
    ...(otherMembers > 0 ? [`${otherMembers} other`] : []),
  ].join(" · ");
  const totalProjects = projectStatuses.length;
  const openProjects = projectStatuses.filter((status) => status === "open").length;
  const orders = allOrders;
  const verifying = orders.filter(
    (order) => order.status === "submitted" || order.status === "pending",
  ).length;

  const stats = [
    {
      label: "Total members",
      value: totalUsers,
      detail: memberBreakdown,
    },
    {
      label: "Open projects",
      value: openProjects,
      detail: `${totalProjects} projects total`,
    },
    {
      label: "Payments to review",
      value: verifying,
      detail: "Awaiting review",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Local hero: CSS background instead of next/image keeps this route
          free of client-side image machinery (and its hydration warning). */}
      <section
        aria-label="Platform operations"
        className="relative isolate overflow-hidden rounded-2xl border border-[#17352b]/10 bg-[#17352b] px-6 py-8 text-[#fffefa] sm:px-9 sm:py-10"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-35 brightness-[0.65] saturate-110"
          style={{ backgroundImage: "url('/images/bhutanese-community.jpg')" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#10241c] via-[#10241c]/90 to-[#10241c]/70"
        />
        <div className="relative z-10 min-w-0 max-w-3xl">
          <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-white text-balance">
            Platform overview
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/75 sm:text-base">
            <span className="font-medium text-amber-200/90">Platform operations ·</span>{" "}
            Members, projects and payment reviews at a glance.
          </p>
        </div>
        <div className="relative z-10 mt-8 border-t border-white/15 pt-3 sm:absolute sm:bottom-5 sm:right-6 sm:mt-0 sm:border-0 sm:pt-0">
          <PhotoCredit
            fileUrl="https://commons.wikimedia.org/wiki/File:Boys_in_Bhutan_national_dress.jpg"
            className="text-white/70"
          />
        </div>
      </section>

      <WorkspaceStats stats={stats} />

      <AdminChartDefs />
      <section aria-label="Platform data visuals" className="space-y-4">
        <h2 className="sr-only">Platform data by role, stage and month</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <RoleDonut counts={profileCounts} />
          <ProjectStageBars statuses={projectStatuses} />
        </div>
        <ActivityTrend
          projectDates={projectRows.map((p) => p.created_at)}
          orderDates={allOrders.map((o) => o.created_at)}
        />
      </section>

      {verifying > 0 && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-amber-200/70 bg-amber-50/70 px-5 py-3.5 text-sm text-[#17352b]"
        >
          <span>
            {verifying} payment{verifying === 1 ? "" : "s"} waiting for review.
          </span>
          <Link
            href="/admin/payments"
            className="inline-flex min-h-9 shrink-0 items-center rounded text-sm font-semibold text-[#b23c26] hover:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
          >
            Review payments
          </Link>
        </div>
      )}

      <section className="grid grid-cols-12 gap-6 lg:gap-8">
        <div className="col-span-12 min-w-0 lg:col-span-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight text-[#17352b]">
              Recent payment orders
            </h2>
            <Link
              href="/admin/payments"
              className="inline-flex min-h-9 shrink-0 items-center rounded text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
            >
              All orders
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#ded8cb] bg-[#fffefa] px-6 py-8">
              <p className="text-sm text-[#657069]">
                No orders yet. Founder payments will appear here for review.
              </p>
              <Link
                href="/admin/payments"
                className="mt-3 inline-flex min-h-9 items-center rounded text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
              >
                Open payments
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#ded8cb] border-y border-[#ded8cb]">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium tabular-nums text-[#17352b]">
                      {order.package === "full" ? "Full Support" : "Basic"} shortlist
                      {typeof order.amount === "number" && Number.isFinite(order.amount)
                        ? ` · Nu ${order.amount.toLocaleString("en-IN")}`
                        : ""}
                    </p>
                    <p className="mt-0.5 text-xs tabular-nums text-[#657069]">
                      {new Date(order.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        timeZone: "UTC",
                      })}
                    </p>
                  </div>
                  <Badge className="shrink-0 gap-1.5 border-[#ded8cb] bg-[#f5f2ea] text-[#17352b]">
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${
                        order.status === "confirmed"
                          ? "bg-[#17352b]"
                          : order.status === "rejected"
                            ? "bg-[#b23c26]"
                            : "bg-[#b08947]"
                      }`}
                    />
                    {order.status === "submitted"
                      ? "Verifying payment"
                      : order.status === "pending"
                        ? "Awaiting payment"
                        : order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-12 min-w-0 lg:col-span-4">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#17352b]">
            Go to
          </h2>
          <nav
            aria-label="Admin shortcuts"
            className="workspace-paper divide-y divide-[#ded8cb] border-y border-[#ded8cb]"
          >
            {[
              {
                href: "/admin/students",
                title: "Students",
                description: "Rank and verify profiles",
              },
              {
                href: "/admin/payments",
                title: "Payments",
                description: "Confirm or reject orders",
              },
              {
                href: "/admin/projects",
                title: "Projects",
                description: "Review all listings",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col gap-0.5 rounded py-3.5 text-sm font-medium text-[#17352b] transition-colors hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
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

/**
 * Admin Dashboard — platform overview stats and recent payment orders.
 */
import Link from "next/link";
import {
  listRoleCounts,
  listProjectStatuses,
  listOrders,
} from "@/lib/neon-data";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { WorkspaceStats } from "@/components/layout/workspace-stats";
import { Badge } from "@/components/ui/badge";
import {
  HoverLift,
  Reveal,
  StaggerGroup,
  StaggerItem,
} from "@/components/ui/motion";

export const metadata = { title: "Admin Dashboard | Bhutan Tech Connect" };

export default async function AdminDashboard() {
  const [profileCounts, projectStatuses, allOrders] = await Promise.all([
    listRoleCounts(),
    listProjectStatuses(),
    listOrders(),
  ]);

  const profiles = profileCounts.flatMap((c) => Array<string>(c.count).fill(c.role));
  const projects = projectStatuses.map((status) => ({ status }));
  const orders = allOrders;

  const totalUsers = profiles.length;
  const students = profiles.filter((role) => role === "student").length;
  const founders = profiles.filter((role) => role === "founder").length;
  const openProjects = projects.filter((p) => p.status === "open").length;
  const verifying = orders.filter((o) => o.status === "submitted").length;

  const stats = [
    {
      label: "Total members",
      value: totalUsers,
      detail: `${founders} founders · ${students} students`,
    },
    {
      label: "Student accounts",
      value: students,
      detail: null,
    },
    {
      label: "Open projects",
      value: openProjects,
      detail: `${projects.length} projects total`,
    },
    {
      label: "Payments to review",
      value: verifying,
      detail: "Awaiting confirmation",
    },
  ];

  return (
    <div className="space-y-8">
      <Reveal>
        <WorkspaceHero
          eyebrow="Platform operations"
          title="Platform overview"
          description="Members, projects and payment reviews at a glance."
        />
      </Reveal>

      <Reveal>
        <WorkspaceStats stats={stats} />
      </Reveal>

      {verifying > 0 && (
        <Reveal>
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-amber-200/70 bg-amber-50/70 px-5 py-3.5 text-sm text-[#17352b]"
          >
            <span>
              {verifying} payment{verifying === 1 ? "" : "s"} waiting for
              verification.
            </span>
            <Link
              href="/admin/payments"
              className="inline-flex shrink-0 items-center text-sm font-semibold text-[#b23c26] hover:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
            >
              Review payments
            </Link>
          </div>
        </Reveal>
      )}

      <section className="grid grid-cols-12 gap-6 lg:gap-8">
        <div className="col-span-12 min-w-0 lg:col-span-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight text-[#17352b]">
              Recent payment orders
            </h2>
            <Link
              href="/admin/payments"
              className="inline-flex shrink-0 items-center text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
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
                className="mt-3 inline-flex min-h-9 items-center text-sm font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
              >
                Open payments
              </Link>
            </div>
          ) : (
            <StaggerGroup className="divide-y divide-[#ded8cb] border-y border-[#ded8cb]">
              {orders.slice(0, 5).map((order) => (
                <StaggerItem key={order.id}>
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#17352b]">
                        {order.package === "full" ? "Full Support" : "Basic"} shortlist
                        {order.amount != null
                          ? ` · Nu ${order.amount.toLocaleString("en-IN")}`
                          : ""}
                      </p>
                      <p className="mt-0.5 text-xs tabular-nums text-[#657069]">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short" },
                        )}
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
                        : order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                    </Badge>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>

        <div className="col-span-12 min-w-0 lg:col-span-4">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#17352b]">
            Go to
          </h2>
          <nav aria-label="Admin shortcuts" className="workspace-paper divide-y divide-[#ded8cb] border-y border-[#ded8cb]">
            {[
              { href: "/admin/students", title: "Students", description: "Rank and verify profiles" },
              { href: "/admin/payments", title: "Payments", description: "Confirm or reject orders" },
              { href: "/admin/projects", title: "Projects", description: "Review all listings" },
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

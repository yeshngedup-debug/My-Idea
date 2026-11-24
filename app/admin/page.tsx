/**
 * Admin Dashboard — platform overview stats and recent payment orders.
 */
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CreditCard,
  Users,
  GraduationCap,
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

export const metadata = { title: "Admin Dashboard | Bhutan Tech Connect" };

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [profRes, projRes, ordRes] = await Promise.all([
    supabase.from("profiles").select("role"),
    supabase.from("projects").select("id, status"),
    supabase
      .from("shortlist_orders")
      .select("id, package, amount, status, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const profiles = (profRes.data ?? []) as { role: string }[];
  const projects = (projRes.data ?? []) as { status: string }[];
  const orders = (ordRes.data ?? []) as {
    id: string;
    package: string;
    amount: number | null;
    status: string;
    created_at: string;
  }[];

  const totalUsers = profiles.length;
  const students = profiles.filter((p) => p.role === "student").length;
  const founders = profiles.filter((p) => p.role === "founder").length;
  const openProjects = projects.filter((p) => p.status === "open").length;
  const verifying = orders.filter((o) => o.status === "submitted").length;

  const stats = [
    {
      label: "Total members",
      value: totalUsers,
      detail: `${founders} founders · ${students} students`,
      icon: Users,
    },
    {
      label: "Student accounts",
      value: students,
      detail: null,
      icon: GraduationCap,
    },
    {
      label: "Open projects",
      value: openProjects,
      detail: `${projects.length} projects total`,
      icon: BriefcaseBusiness,
    },
    {
      label: "Payments to review",
      value: verifying,
      detail: "Awaiting confirmation",
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-8">
      <Reveal>
        <WorkspaceHero
          eyebrow="Platform operations"
          title="Platform overview"
          description="Members, projects and payments."
        />
      </Reveal>

      <StaggerGroup className="grid grid-flow-dense grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[#17352b]/10 bg-[#17352b]/10 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, detail, icon: Icon }) => (
          <StaggerItem key={label} className="bg-[#fffefa]">
            <div className="flex h-full items-start justify-between gap-3 p-5">
              <div>
                <p className="text-xs font-medium text-[#657069]">{label}</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-[#17352b]">
                  {value}
                </p>
                {detail && <p className="mt-2 text-xs text-[#657069]">{detail}</p>}
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#17352b]/6 text-[#17352b]">
                <Icon aria-hidden="true" className="h-4.5 w-4.5" />
              </span>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      {verifying > 0 && (
        <Reveal>
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-[#17352b]"
          >
            <span>
              {verifying} payment{verifying === 1 ? "" : "s"} waiting for
              verification.
            </span>
            <Link
              href="/admin/payments"
              className="group inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#b23c26] hover:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
            >
              Review payments
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-[1.01] motion-reduce:transform-none"
              />
            </Link>
          </div>
        </Reveal>
      )}

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h3 className="mb-4 text-lg font-semibold tracking-tight text-[#17352b]">
            Recent payment orders
          </h3>
          {orders.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#ded8cb] bg-[#fffefa] px-6 py-8 text-sm text-[#657069]">
              No orders yet. Founder payments will appear here for review.
            </p>
          ) : (
            <StaggerGroup className="space-y-2.5">
              {orders.slice(0, 5).map((order) => (
                <StaggerItem key={order.id}>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#17352b]">
                        {order.package === "full" ? "Full Support" : "Basic"} shortlist
                        {order.amount != null
                          ? ` · Nu ${order.amount.toLocaleString("en-IN")}`
                          : ""}
                      </p>
                      <p className="mt-1 text-xs text-[#657069]">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short" },
                        )}
                      </p>
                    </div>
                    <Badge className="shrink-0 capitalize border-[#ded8cb] bg-[#f5f2ea] text-[#17352b]">
                      {order.status}
                    </Badge>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold tracking-tight text-[#17352b]">
            Quick links
          </h3>
          <StaggerGroup className="grid grid-flow-dense gap-px overflow-hidden rounded-xl border border-[#17352b]/10 bg-[#17352b]/10">
            {[
              { href: "/admin/students", title: "Students", description: "Rank and verify profiles" },
              { href: "/admin/payments", title: "Payments", description: "Confirm or reject orders" },
              { href: "/admin/projects", title: "Projects", description: "Review all listings" },
            ].map((item) => (
              <StaggerItem key={item.href} className="bg-[#fffefa]">
                <HoverLift>
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between gap-3 px-4 py-4 text-sm font-semibold text-[#17352b] transition-colors hover:bg-[#f5f2ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
                  >
                    <span>
                      {item.title}
                      <span className="mt-1 block text-xs font-normal text-[#657069]">
                        {item.description}
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-[#b23c26] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-[1.01] motion-reduce:transform-none"
                    />
                  </Link>
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </div>
  );
}

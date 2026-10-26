/**
 * Admin Dashboard — real platform stats: users by role, projects,
 * payment orders awaiting verification, recent orders.
 */
import Link from 'next/link';
import { Users, GraduationCap, Briefcase, Wallet, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/dashboard/stat-card';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Admin Dashboard | Bhutan Tech Connect' };

const ORDER_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Awaiting payment', cls: 'bg-amber-400/10 text-amber-300' },
  submitted: { label: 'Verifying', cls: 'bg-blue-400/10 text-blue-300' },
  confirmed: { label: 'Confirmed', cls: 'bg-emerald-400/10 text-emerald-300' },
  rejected: { label: 'Rejected', cls: 'bg-red-400/10 text-red-300' },
};

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [profRes, projRes, ordRes] = await Promise.all([
    supabase.from('profiles').select('role'),
    supabase.from('projects').select('id, status'),
    supabase
      .from('shortlist_orders')
      .select('id, package, amount, status, created_at')
      .order('created_at', { ascending: false }),
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
  const students = profiles.filter((p) => p.role === 'student').length;
  const founders = profiles.filter((p) => p.role === 'founder').length;
  const openProjects = projects.filter((p) => p.status === 'open').length;
  const verifying = orders.filter((o) => o.status === 'submitted').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tighter">Platform overview</h2>
        <p className="text-white/50 mt-1 text-sm">
          Live counts — verify payments and manage students from the menu.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total users" value={totalUsers} sub={`${founders} founders · ${students} students`} />
        <StatCard icon={GraduationCap} label="Students" value={students} sub="Registered accounts" />
        <StatCard icon={Briefcase} label="Open projects" value={openProjects} sub={`${projects.length} total`} />
        <StatCard
          icon={Wallet}
          label="To verify"
          value={verifying}
          sub={verifying > 0 ? 'Payments awaiting review' : 'No payments pending'}
        />
      </div>

      {verifying > 0 && (
        <div className="rounded-xl bg-blue-400/10 border border-blue-400/30 px-4 py-3 text-sm text-blue-300 flex items-center justify-between gap-3">
          <span>
            {verifying} payment{verifying === 1 ? '' : 's'} waiting for verification.
          </span>
          <Link
            href="/admin/payments"
            className="text-xs font-bold underline underline-offset-2 hover:text-blue-200"
          >
            Review now
          </Link>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent orders */}
        <section className="bg-[#13111a] ring-1 ring-white/10 rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Recent payment orders</h3>
            <Link
              href="/admin/payments"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              View all
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-white/50 text-center py-8">
              No orders yet. Founder payments appear here for verification.
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {orders.slice(0, 4).map((o) => {
                const badge = ORDER_BADGE[o.status] ?? ORDER_BADGE.pending;
                return (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {o.package === 'full' ? 'Full Support' : 'Basic'} shortlist
                        {o.amount != null ? ` — Nu ${o.amount.toLocaleString('en-IN')}` : ''}
                      </p>
                      <p className="text-xs text-white/40">
                        {new Date(o.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                    <Badge className={`shrink-0 ${badge.cls}`}>{badge.label}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Quick links */}
        <section className="bg-[#13111a] ring-1 ring-white/10 rounded-xl p-5">
          <h3 className="text-base font-semibold mb-1">Manage</h3>
          <p className="text-xs text-white/40 mb-4">Day-to-day admin work.</p>
          <div className="space-y-2">
            <Link
              href="/admin/students"
              className="flex items-center justify-between rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-sm font-medium transition-colors"
            >
              Students — rank and verify <ArrowRight className="w-4 h-4 text-white/40" />
            </Link>
            <Link
              href="/admin/payments"
              className="flex items-center justify-between rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-sm font-medium transition-colors"
            >
              Payments — confirm or reject <ArrowRight className="w-4 h-4 text-white/40" />
            </Link>
            <Link
              href="/admin/projects"
              className="flex items-center justify-between rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-sm font-medium transition-colors"
            >
              All projects <ArrowRight className="w-4 h-4 text-white/40" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

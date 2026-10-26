/**
 * Founder Dashboard — real data: project stats, applications received,
 * shortlisted students, order status, recent projects, quick actions.
 */
import Link from 'next/link';
import { Briefcase, Inbox, Star, Wallet, ArrowRight, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/dashboard/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Founder Dashboard | Bhutan Tech Connect' };

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  open: { label: 'Open', cls: 'bg-emerald-400/10 text-emerald-300' },
  in_progress: { label: 'In progress', cls: 'bg-amber-400/10 text-amber-300' },
  review: { label: 'In review', cls: 'bg-blue-400/10 text-blue-300' },
  completed: { label: 'Completed', cls: 'bg-white/10 text-white/60' },
};

export default async function FounderDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name = 'Founder';
  let projects: {
    id: string;
    title: string;
    status: string;
    budget_min: number | null;
    budget_max: number | null;
    created_at: string;
  }[] = [];
  let applicationsReceived = 0;
  let shortlistedCount = 0;
  let confirmedOrders = 0;

  if (user) {
    const [profRes, projRes, slRes, ordRes] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', user.id).single(),
      supabase
        .from('projects')
        .select('id, title, status, budget_min, budget_max, created_at')
        .eq('founder_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('shortlists').select('id').eq('founder_id', user.id),
      supabase.from('shortlist_orders').select('id, status').eq('founder_id', user.id),
    ]);

    name = (profRes.data as { full_name: string | null } | null)?.full_name ?? name;
    projects = (projRes.data as typeof projects) ?? [];
    shortlistedCount = slRes.data?.length ?? 0;
    confirmedOrders = (ordRes.data ?? []).filter((o) => o.status === 'confirmed').length;

    const ids = projects.map((p) => p.id);
    if (ids.length > 0) {
      const { data: apps } = await supabase
        .from('applications')
        .select('id')
        .in('project_id', ids);
      applicationsReceived = apps?.length ?? 0;
    }
  }

  const openProjects = projects.filter((p) => p.status === 'open').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tighter">
            Welcome back, {name.split(' ')[0]}
          </h2>
          <p className="text-white/50 mt-1 text-sm">
            Manage projects and find the right students.
          </p>
        </div>
        <Link href="/founder/projects/post">
          <Button className="bg-amber-400 text-black font-bold hover:bg-amber-300 h-10">
            <Plus className="w-4 h-4 mr-1" /> Post a project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Open projects" value={openProjects} sub={`${projects.length} total posted`} />
        <StatCard icon={Inbox} label="Applications" value={applicationsReceived} sub="Received across projects" />
        <StatCard icon={Star} label="Shortlisted" value={shortlistedCount} sub="Students on your lists" />
        <StatCard icon={Wallet} label="Orders confirmed" value={confirmedOrders} sub="Premium shortlists" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent projects */}
        <section className="bg-[#13111a] ring-1 ring-white/10 rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Your projects</h3>
            <Link
              href="/founder/projects"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              View all
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-white/50 mb-4">
                No projects yet. Post your first one to start receiving applications.
              </p>
              <Link href="/founder/projects/post">
                <Button className="bg-amber-400 text-black font-bold hover:bg-amber-300 h-10">
                  Post a project <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {projects.slice(0, 4).map((p) => {
                const badge = STATUS_LABEL[p.status] ?? STATUS_LABEL.open;
                const budget =
                  p.budget_min != null
                    ? p.budget_max != null && p.budget_max !== p.budget_min
                      ? `Nu ${p.budget_min.toLocaleString('en-IN')}-${p.budget_max.toLocaleString('en-IN')}`
                      : `Nu ${p.budget_min.toLocaleString('en-IN')}`
                    : null;
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{p.title}</p>
                      <p className="text-xs text-white/40">
                        {budget ? `${budget} · ` : ''}
                        Posted{' '}
                        {new Date(p.created_at).toLocaleDateString('en-GB', {
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

        {/* Quick actions */}
        <section className="bg-[#13111a] ring-1 ring-white/10 rounded-xl p-5">
          <h3 className="text-base font-semibold mb-1">Quick actions</h3>
          <p className="text-xs text-white/40 mb-4">Hire faster.</p>
          <div className="space-y-2">
            <Link
              href="/founder/browse-students"
              className="flex items-center justify-between rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-sm font-medium transition-colors"
            >
              Browse students <ArrowRight className="w-4 h-4 text-white/40" />
            </Link>
            <Link
              href="/founder/projects/post"
              className="flex items-center justify-between rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-sm font-medium transition-colors"
            >
              Post a new project <ArrowRight className="w-4 h-4 text-white/40" />
            </Link>
            <Link
              href="/founder/shortlists"
              className="flex items-center justify-between rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-sm font-medium transition-colors"
            >
              Premium shortlists <ArrowRight className="w-4 h-4 text-white/40" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

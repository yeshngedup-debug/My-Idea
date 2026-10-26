/**
 * Student Dashboard — real data: application stats, recent applications,
 * profile completion. AdminCN-style stat cards on the dark brand.
 */
import Link from 'next/link';
import { FileText, UserCheck, ClipboardList, Gauge, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/dashboard/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Student Dashboard | Bhutan Tech Connect' };

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-amber-400/10 text-amber-300' },
  shortlisted: { label: 'Shortlisted', cls: 'bg-blue-400/10 text-blue-300' },
  accepted: { label: 'Accepted', cls: 'bg-emerald-400/10 text-emerald-300' },
  rejected: { label: 'Rejected', cls: 'bg-red-400/10 text-red-300' },
};

export default async function StudentDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name = 'Student';
  let applications: {
    id: string;
    status: string;
    created_at: string;
    project: { title: string } | null;
  }[] = [];
  let completion = 0;
  let cvReady = false;

  if (user) {
    const [appsRes, profRes] = await Promise.all([
      supabase
        .from('applications')
        .select('id, status, created_at, project:projects(title)')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('student_profiles')
        .select('full_name, college, course, year, skills, bio, availability, cv_path')
        .eq('id', user.id)
        .single(),
    ]);

    applications = (appsRes.data as unknown as typeof applications) ?? [];

    const sp = profRes.data as Record<string, unknown> | null;
    if (sp) {
      name = (sp.full_name as string) || name;
      const checks = [
        String(sp.full_name ?? '').trim().length > 1,
        String(sp.college ?? '').trim().length > 1,
        String(sp.course ?? '').trim().length > 1,
        !!sp.year,
        ((sp.skills as string[]) ?? []).length > 0,
        String(sp.bio ?? '').length > 20,
        !!sp.availability,
        !!sp.cv_path,
      ];
      completion = Math.round((checks.filter(Boolean).length / checks.length) * 100);
      cvReady = !!sp.cv_path;
    } else if (user.user_metadata?.full_name) {
      name = String(user.user_metadata.full_name);
    }
  }

  const shortlisted = applications.filter((a) => a.status === 'shortlisted').length;
  const accepted = applications.filter((a) => a.status === 'accepted').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tighter">
          Welcome back, {name.split(' ')[0]}
        </h2>
        <p className="text-white/50 mt-1 text-sm">
          Track your applications and keep your profile sharp for founders.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Applications" value={applications.length} sub="Total sent" />
        <StatCard icon={UserCheck} label="Shortlisted" value={shortlisted} sub="Waiting on founders" />
        <StatCard icon={ClipboardList} label="Accepted" value={accepted} sub="Offers won" />
        <StatCard
          icon={Gauge}
          label="Profile"
          value={`${completion}%`}
          sub={cvReady ? 'CV uploaded' : 'CV missing'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent applications */}
        <section className="bg-[#13111a] ring-1 ring-white/10 rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Recent applications</h3>
            <Link
              href="/student/applications"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              View all
            </Link>
          </div>
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-white/50 mb-4">You haven't applied to any projects yet.</p>
              <Link href="/student/projects">
                <Button className="bg-amber-400 text-black font-bold hover:bg-amber-300 h-10">
                  Browse projects <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {applications.slice(0, 4).map((a) => {
                const badge = STATUS_BADGE[a.status] ?? STATUS_BADGE.pending;
                return (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {a.project?.title ?? 'Project'}
                      </p>
                      <p className="text-xs text-white/40">
                        Applied{' '}
                        {new Date(a.created_at).toLocaleDateString('en-GB', {
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
          <p className="text-xs text-white/40 mb-4">Keep moving forward.</p>
          <div className="space-y-2">
            <Link
              href="/student/projects"
              className="flex items-center justify-between rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-sm font-medium transition-colors"
            >
              Browse open projects <ArrowRight className="w-4 h-4 text-white/40" />
            </Link>
            <Link
              href="/student/profile"
              className="flex items-center justify-between rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-sm font-medium transition-colors"
            >
              {completion < 100 ? `Complete profile (${completion}%)` : 'Update profile'}
              <ArrowRight className="w-4 h-4 text-white/40" />
            </Link>
            <Link
              href="/student/applications"
              className="flex items-center justify-between rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-sm font-medium transition-colors"
            >
              Track applications <ArrowRight className="w-4 h-4 text-white/40" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * Student Applications — server component.
 * Lists the logged-in student's applications joined with project info.
 * Mobile-first shell: top bar on phones, sidebar on lg+.
 */
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'My Applications | Bhutan Tech Connect' };

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-amber-400/10 text-amber-300' },
  shortlisted: { label: 'Shortlisted', cls: 'bg-blue-400/10 text-blue-300' },
  accepted: { label: 'Accepted', cls: 'bg-emerald-400/10 text-emerald-300' },
  rejected: { label: 'Rejected', cls: 'bg-red-400/10 text-red-300' },
};

interface AppRow {
  id: string;
  status: string;
  created_at: string;
  project: {
    id: string;
    title: string;
    duration: string | null;
    work_mode: string;
    status: string;
  } | null;
}

export default async function StudentApplicationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let rows: AppRow[] = [];

  if (user) {
    const { data } = await supabase
      .from('applications')
      .select('id, status, created_at, project:projects(id, title, duration, work_mode, status)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    rows = (data as unknown as AppRow[]) ?? [];
  }

  return (
    <div className="min-h-screen bg-[#0c0b10] text-white">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0c0b10]/90 backdrop-blur-md border-b border-white/10 px-4 h-14 flex items-center gap-3">
        <Link
          href="/student"
          aria-label="Back to dashboard"
          className="p-2 -ml-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-extrabold tracking-tight">My Applications</h1>
      </header>

      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white/[0.03] backdrop-blur-xl border-r border-white/10 flex-col p-6 z-30">
        <h1 className="text-lg font-extrabold tracking-tight mb-8">My Applications</h1>
        <Link
          href="/student"
          className="px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          Back to dashboard
        </Link>
      </aside>

      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10 max-w-2xl mx-auto lg:max-w-none lg:mx-0">
        <div className="hidden lg:block mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter">My Applications</h2>
          <p className="text-white/50 mt-1">Track the projects you applied to and their status.</p>
        </div>

        {rows.length === 0 ? (
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-10 text-center">
            <h3 className="text-xl font-extrabold tracking-tight mb-2">
              You haven't applied to any projects yet
            </h3>
            <p className="text-white/50 text-sm mb-6">
              Browse open projects and apply to ones that match your skills.
            </p>
            <Link
              href="/student/projects"
              className="inline-flex items-center gap-2 bg-amber-400 text-black px-6 py-3 rounded-full font-bold hover:bg-amber-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Browse projects <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((a) => {
              const badge = STATUS_BADGE[a.status] ?? STATUS_BADGE.pending;
              return (
                <li
                  key={a.id}
                  className="bg-white/[0.04] border border-white/10 rounded-3xl p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="text-base font-extrabold tracking-tight truncate">
                      {a.project?.title ?? 'Project'}
                    </h3>
                    <Badge className={`shrink-0 ${badge.cls}`}>{badge.label}</Badge>
                  </div>
                  <p className="text-xs text-white/40">
                    Applied{' '}
                    {new Date(a.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                    {a.project
                      ? ` · ${a.project.duration ?? 'Flexible duration'} · ${
                          a.project.work_mode === 'onsite' ? 'Onsite' : 'Remote'
                        }`
                      : ''}
                    {a.project && a.project.status !== 'open'
                      ? ` · Project ${a.project.status.replace('_', ' ')}`
                      : ''}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

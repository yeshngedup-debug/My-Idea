/**
 * My Projects — founder's posted projects list.
 * Server component: reads projects owned by the signed-in founder.
 */
import Link from 'next/link';
import { Plus, MapPin, CalendarDays, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'My Projects | Bhutan Tech Connect' };

type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  required_skills: string[] | null;
  duration: string | null;
  budget_min: number | null;
  budget_max: number | null;
  work_mode: string;
  deadline: string | null;
  status: string;
  created_at: string;
  applications: { count: number }[] | null;
};

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-emerald-400/10 text-emerald-300',
  in_progress: 'bg-amber-400/10 text-amber-300',
  review: 'bg-blue-400/10 text-blue-300',
  completed: 'bg-white/10 text-white/60',
};

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  in_progress: 'In progress',
  review: 'In review',
  completed: 'Completed',
};

const nu = (n: number) => `Nu. ${n.toLocaleString('en-IN')}`;

export default async function MyProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let projects: ProjectRow[] = [];
  if (user) {
    const { data } = await supabase
      .from('projects')
      .select(
        'id, title, description, required_skills, duration, budget_min, budget_max, work_mode, deadline, status, created_at, applications(count)'
      )
      .eq('founder_id', user.id)
      .order('created_at', { ascending: false });

    projects = (data as unknown as ProjectRow[]) ?? [];
  }

  return (
    <div className="min-h-screen bg-[#0c0b10] text-white">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0c0b10]/90 backdrop-blur-md border-b border-white/10 px-4 h-14 flex items-center justify-between">
        <Link
          href="/founder"
          aria-label="Back to dashboard"
          className="p-2 -ml-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <span className="text-sm font-semibold">Back</span>
        </Link>
        <h1 className="text-base font-extrabold tracking-tight">My Projects</h1>
        <Link
          href="/founder/projects/post"
          aria-label="Post a project"
          className="p-2 -mr-2 rounded-xl bg-amber-400 text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </header>

      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white/[0.03] backdrop-blur-xl border-r border-white/10 flex-col p-6 z-30">
        <h1 className="text-lg font-extrabold tracking-tight mb-8">My Projects</h1>
        <Link
          href="/founder"
          className="px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          Back to dashboard
        </Link>
      </aside>

      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10 max-w-3xl mx-auto lg:max-w-none lg:mx-0">
        <div className="hidden lg:flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter">My Projects</h2>
            <p className="text-white/50 mt-1">{projects.length} posted</p>
          </div>
          <Button
            asChild
            className="bg-amber-400 text-black font-bold hover:bg-amber-300 h-11 px-5"
          >
            <Link href="/founder/projects/post">
              <Plus className="w-4 h-4 mr-1" /> Post a project
            </Link>
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-10 text-center">
            <h3 className="text-xl font-extrabold tracking-tight mb-2">No projects yet</h3>
            <p className="text-white/50 text-sm mb-6">
              Post your first short paid project and students can apply right away.
            </p>
            <Button asChild className="bg-amber-400 text-black font-bold hover:bg-amber-300 h-11 px-6">
              <Link href="/founder/projects/post">Post your first project</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {projects.map((p) => {
              const applicants = p.applications?.[0]?.count ?? 0;
              return (
                <li
                  key={p.id}
                  className="bg-white/[0.04] border border-white/10 rounded-3xl p-5 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-extrabold tracking-tight leading-snug">{p.title}</h3>
                    <Badge className={`shrink-0 ${STATUS_STYLES[p.status] ?? 'bg-white/10 text-white/60'}`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </Badge>
                  </div>

                  {p.description && (
                    <p className="text-sm text-white/50 line-clamp-2 mb-3">{p.description}</p>
                  )}

                  {(p.required_skills?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {p.required_skills!.slice(0, 5).map((s) => (
                        <Badge key={s} variant="outline" className="text-white/60">
                          {s}
                        </Badge>
                      ))}
                      {p.required_skills!.length > 5 && (
                        <Badge variant="outline" className="text-white/40">
                          +{p.required_skills!.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/40">
                    {p.budget_min != null && p.budget_max != null && (
                      <span className="font-semibold text-amber-400 text-sm">
                        {nu(p.budget_min)} - {nu(p.budget_max)}
                      </span>
                    )}
                    {p.duration && <span>{p.duration}</span>}
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {p.work_mode === 'remote' ? 'Remote' : 'On-site'}
                    </span>
                    {p.deadline && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        Apply by{' '}
                        {new Date(p.deadline).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {applicants} {applicants === 1 ? 'applicant' : 'applicants'}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

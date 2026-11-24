/**
 * Student Applications — server component.
 * Lists the logged-in student's applications joined with project info.
 */
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { StatusTimeline, STUDENT_APPLICATION_STEPS } from '@/components/ui/status-timeline';

export const metadata = { title: 'My Applications | Bhutan Tech Connect' };

export default async function StudentApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let rows: { id: string; status: string; created_at: string; project: { title: string } | null }[] = [];

  if (user) {
    const { data } = await supabase
      .from('applications')
      .select('id, status, created_at, project:projects(title)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    rows = (data as unknown as typeof rows) ?? [];
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold tracking-tight text-[#17352b] sm:text-3xl">
          My Applications
        </h2>

        {rows.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[#ded8cb] bg-[#fffefa] p-10 text-center">
            <h3 className="mb-2 text-lg font-semibold text-[#17352b]">
              You haven&apos;t applied to any projects yet
            </h3>
            <p className="mb-6 text-sm text-[#657069]">
              Browse open projects and apply to ones that match your skills.
            </p>
            <Link
              href="/student/projects"
              className="pressable inline-flex min-h-11 items-center rounded-full bg-[#17352b] px-6 py-3 text-sm font-bold text-[#fffefa] transition-colors hover:bg-[#244b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2"
            >
              Browse projects
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {rows.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-[#ded8cb] bg-[#fffefa] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#17352b]">
                      {a.project?.title ?? 'Project'}
                    </p>
                    <p className="mt-1 text-xs text-[#657069]">
                      Applied{' '}
                      {new Date(a.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <Badge className="shrink-0 border-[#ded8cb] bg-[#f5f2ea] text-[#17352b] capitalize">
                    {a.status.replace('_', ' ')}
                  </Badge>
                </div>
                <StatusTimeline
                  steps={STUDENT_APPLICATION_STEPS}
                  status={a.status}
                  label={`Application status for ${a.project?.title ?? 'project'}`}
                  compact
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

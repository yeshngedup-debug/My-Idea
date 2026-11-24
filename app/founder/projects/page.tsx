/**
 * My Projects — founder's posted projects list.
 */
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'My Projects | Bhutan Tech Connect' };

export default async function MyProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let projects: { id: string; title: string; status: string; created_at: string }[] = [];

  if (user) {
    const { data } = await supabase
      .from('projects')
      .select('id, title, status, created_at')
      .eq('founder_id', user.id)
      .order('created_at', { ascending: false });

    projects = (data as typeof projects) ?? [];
  }

  const date = (value: string) =>
    new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <div className="space-y-6 px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#17352b] sm:text-3xl">
            My Projects
          </h2>
          <p className="mt-1 text-sm text-[#657069]">{projects.length} posted</p>
        </div>
        <Link href="/founder/projects/post">
          <Button className="pressable bg-[#17352b] font-bold text-[#fffefa] hover:bg-[#244b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]">
            Post a project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ded8cb] bg-[#fffefa] p-10 text-center">
          <h3 className="mb-2 text-lg font-semibold text-[#17352b]">No projects yet</h3>
          <p className="mb-6 text-sm text-[#657069]">
            Post your first short paid project and students can apply right away.
          </p>
          <Link href="/founder/projects/post">
            <Button className="pressable w-full bg-[#17352b] font-bold text-[#fffefa] hover:bg-[#244b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]">
              Post your first project
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-2.5 sm:hidden">
            {projects.map((p) => (
              <li key={p.id} className="rounded-xl border border-[#ded8cb] bg-[#fffefa] p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold text-[#17352b]">
                    {p.title}
                  </p>
                  <Badge className="shrink-0 border-[#ded8cb] bg-[#f5f2ea] text-[#17352b] capitalize">
                    {p.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-[#657069]">{date(p.created_at)}</p>
                <Link
                  href={`/founder/projects/${p.id}`}
                  className="mt-3 inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
                >
                  View applicants <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden rounded-xl border border-[#ded8cb] bg-[#fffefa] sm:block">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-[72px] z-10 bg-[#f5f2ea] text-xs uppercase tracking-wide text-[#657069]">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold first:rounded-tl-xl">Project</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Posted</th>
                  <th scope="col" className="px-4 py-3 font-semibold last:rounded-tr-xl">
                    <span className="sr-only">Applicants</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ded8cb]">
                {projects.map((p) => (
                  <tr key={p.id} className="transition-colors duration-150 hover:bg-[#f5f2ea]">
                    <td className="max-w-xs truncate px-4 py-3.5 font-semibold text-[#17352b]">
                      {p.title}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge className="border-[#ded8cb] bg-[#f5f2ea] text-[#17352b] capitalize">
                        {p.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#657069]">{date(p.created_at)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/founder/projects/${p.id}`}
                        className="group inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
                      >
                        View applicants
                        <span
                          aria-hidden="true"
                          className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-[1.01] motion-reduce:transform-none"
                        >
                          →
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

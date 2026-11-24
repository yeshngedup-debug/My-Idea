/**
 * Admin — Projects: a minimal real list of all project postings.
 */
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Projects | Admin | Bhutan Tech Connect' };

const STATUS_BADGE: Record<string, string> = {
  open: 'border-amber-200 bg-amber-50 text-[#8a5a00]',
  in_progress: 'border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]',
  review: 'border-[#b23c26]/25 bg-[#b23c26]/8 text-[#b23c26]',
  completed: 'border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]',
};

interface Row {
  id: string;
  title: string;
  status: string;
  created_at: string;
  founder_id: string;
  founderName?: string | null;
}

export default async function AdminProjectsPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase.from('projects').select('id, title, status, created_at, founder_id').order('created_at', { ascending: false });

  const rows = (projects as unknown as Row[]) ?? [];

  const founderIds = [...new Set(rows.map((r) => r.founder_id))];
  if (founderIds.length > 0) {
    const { data: fp } = await supabase.from('profiles').select('id, full_name').in('id', founderIds);
    const names = new Map((fp ?? []).map((f) => [f.id as string, f.full_name as string | null]));
    rows.map((r) => {
      r.founderName = names.get(r.founder_id) ?? null;
    });
  }

  const date = (value: string) =>
    new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const statusLabel = (status: string) => status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold tracking-tight text-[#17352b] sm:text-3xl">
          Projects
        </h2>

        {rows.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[#ded8cb] bg-[#fffefa] p-10 text-center">
            <h3 className="mb-2 text-lg font-semibold text-[#17352b]">No projects yet</h3>
            <p className="text-sm text-[#657069]">
              Projects appear here as soon as founders post them.
            </p>
          </div>
        ) : (
          <>
            <ul className="mt-8 space-y-2.5 sm:hidden">
              {rows.map((r) => (
                <li key={r.id} className="rounded-xl border border-[#ded8cb] bg-[#fffefa] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 truncate text-sm font-semibold text-[#17352b]">{r.title}</h3>
                    <Badge className={`shrink-0 ${STATUS_BADGE[r.status] ?? STATUS_BADGE.open}`}>
                      {statusLabel(r.status)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-[#657069]">
                    {r.founderName ?? 'Unknown founder'} · Posted {date(r.created_at)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8 hidden rounded-xl border border-[#ded8cb] bg-[#fffefa] sm:block">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-[72px] z-10 bg-[#f5f2ea] text-xs uppercase tracking-wide text-[#657069]">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold first:rounded-tl-xl">Project</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Founder</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3 font-semibold last:rounded-tr-xl">Posted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ded8cb]">
                  {rows.map((r) => (
                    <tr key={r.id} className="transition-colors duration-150 hover:bg-[#f5f2ea]">
                      <td className="max-w-xs truncate px-4 py-3.5 font-semibold text-[#17352b]">{r.title}</td>
                      <td className="px-4 py-3.5 text-[#4c5a52]">{r.founderName ?? 'Unknown founder'}</td>
                      <td className="px-4 py-3.5">
                        <Badge className={STATUS_BADGE[r.status] ?? STATUS_BADGE.open}>
                          {statusLabel(r.status)}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[#657069]">{date(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

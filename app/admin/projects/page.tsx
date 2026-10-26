/**
 * Admin — Projects: a minimal real list of all project postings.
 * Title, founder, status, and created date. Mobile-first shell.
 */
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Projects | Admin | Bhutan Tech Connect' };

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  open: { label: 'Open', cls: 'bg-amber-400/10 text-amber-300' },
  in_progress: { label: 'In progress', cls: 'bg-blue-400/10 text-blue-300' },
  review: { label: 'In review', cls: 'bg-violet-400/10 text-violet-300' },
  completed: { label: 'Completed', cls: 'bg-emerald-400/10 text-emerald-300' },
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

  let rows: Row[] = [];

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, status, created_at, founder_id')
    .order('created_at', { ascending: false });

  rows = (projects as unknown as Row[]) ?? [];

  // Founder names (admins can read all profiles)
  const founderIds = [...new Set(rows.map((r) => r.founder_id))];
  if (founderIds.length > 0) {
    const { data: fp } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', founderIds);
    const names = new Map((fp ?? []).map((f) => [f.id as string, f.full_name as string | null]));
    rows = rows.map((r) => ({ ...r, founderName: names.get(r.founder_id) ?? null }));
  }

  return (
    <>
        <div className="hidden lg:block mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter">Projects</h2>
          <p className="text-white/50 mt-1">All project postings across the platform.</p>
        </div>

        {rows.length === 0 ? (
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-10 text-center">
            <h3 className="text-xl font-extrabold tracking-tight mb-2">No projects yet</h3>
            <p className="text-white/50 text-sm">
              Projects appear here as soon as founders post them.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => {
              const badge = STATUS_BADGE[r.status] ?? STATUS_BADGE.open;
              return (
                <li
                  key={r.id}
                  className="bg-white/[0.04] border border-white/10 rounded-3xl p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="text-base font-extrabold tracking-tight truncate">{r.title}</h3>
                    <Badge className={`shrink-0 ${badge.cls}`}>{badge.label}</Badge>
                  </div>
                  <p className="text-xs text-white/40">
                    {r.founderName ?? 'Unknown founder'} · Posted{' '}
                    {new Date(r.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </>
  );
}

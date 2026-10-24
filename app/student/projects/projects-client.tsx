'use client';

/**
 * Open Projects client — cards with skills/budget/duration badges
 * and one-tap Apply. Reuses the app's dark mobile-first card style.
 */
import { useState, useTransition } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { applyToProject } from '@/app/actions/projects';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface OpenProject {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  work_mode: string;
  budget_min: number | null;
  budget_max: number | null;
  required_skills: string[] | null;
  deadline: string | null;
}

export function ProjectsClient({
  projects,
  appliedIds,
}: {
  projects: OpenProject[];
  appliedIds: string[];
}) {
  const [applied, setApplied] = useState<Set<string>>(new Set(appliedIds));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [, startTransition] = useTransition();

  function handleApply(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const res = await applyToProject(id);
      if (res.ok) {
        setApplied((prev) => new Set(prev).add(id));
      }
      setStatus({ ok: res.ok, msg: res.message });
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-4">
      {/* Status banner */}
      {status && (
        <p
          role="status"
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border ${
            status.ok
              ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300'
              : 'bg-red-400/10 border-red-400/30 text-red-300'
          }`}
        >
          {status.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0" />
          )}
          {status.msg}
        </p>
      )}

      {projects.length === 0 ? (
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-10 text-center">
          <h3 className="text-xl font-extrabold tracking-tight mb-2">No open projects right now</h3>
          <p className="text-white/50 text-sm">
            New projects appear here as soon as founders post them. Check back soon.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => {
            const isApplied = applied.has(p.id);
            const budget =
              p.budget_min != null
                ? p.budget_max != null && p.budget_max !== p.budget_min
                  ? `Nu ${p.budget_min.toLocaleString('en-IN')}-${p.budget_max.toLocaleString('en-IN')}`
                  : `Nu ${p.budget_min.toLocaleString('en-IN')}`
                : null;
            return (
              <li key={p.id} className="bg-white/[0.04] border border-white/10 rounded-3xl p-5">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="text-base font-extrabold tracking-tight">{p.title}</h3>
                  {budget && <Badge className="shrink-0 bg-amber-400/10 text-amber-300">{budget}</Badge>}
                </div>

                {p.description && (
                  <p className="text-sm text-white/50 line-clamp-2 mb-3">{p.description}</p>
                )}

                {(p.required_skills?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.required_skills!.slice(0, 4).map((k) => (
                      <Badge key={k} variant="outline" className="text-white/60">
                        {k}
                      </Badge>
                    ))}
                    {p.required_skills!.length > 4 && (
                      <Badge variant="outline" className="text-white/40">
                        +{p.required_skills!.length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                <p className="text-xs text-white/40 mb-4">
                  {p.duration ?? 'Flexible duration'} ·{' '}
                  {p.work_mode === 'onsite' ? 'Onsite' : 'Remote'}
                  {p.deadline
                    ? ` · Apply by ${new Date(p.deadline).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}`
                    : ''}
                </p>

                {isApplied ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-400/10 text-emerald-300 px-4 py-2.5 text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Applied
                  </span>
                ) : (
                  <Button
                    type="button"
                    disabled={pendingId === p.id}
                    onClick={() => handleApply(p.id)}
                    className="bg-amber-400 text-black font-bold hover:bg-amber-300 h-11 px-6"
                  >
                    {pendingId === p.id ? 'Applying...' : 'Apply'}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

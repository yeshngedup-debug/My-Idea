/**
 * Workspace figures as quiet cards. The numbers stay legible and tabular, but
 * no single figure dominates the page. Server-only, no icons or charts.
 */
export interface WorkspaceStat {
  label: string;
  value: number | string;
  detail?: string | null;
}

export function WorkspaceStats({ stats }: { stats: WorkspaceStat[] }) {
  const [lead] = stats;
  if (!lead) return null;

  return (
    <section aria-label="Workspace figures">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="min-w-0 rounded-[24px] border border-[#ded8cb] bg-[#fffefa] px-4 py-4 shadow-[0_1px_2px_rgba(24,37,31,.05)]"
          >
            <dt className="text-xs font-medium uppercase tracking-[0.08em] text-[#56645c]">
              {stat.label}
            </dt>
            <dd className="mt-2 text-2xl font-semibold leading-none tabular-nums tracking-tight text-[#17352b]">
              {stat.value}
              {stat.detail ? (
                <span className="mt-2 block text-xs font-normal leading-5 tracking-normal text-[#56645c]">
                  {stat.detail}
                </span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Workspace figures as one dense ledger row rather than a wall of cards.
 * The numbers stay legible and tabular; the surrounding labels carry the
 * context. Server-only, no icons, charts or entrance motion.
 */
export interface WorkspaceStat {
  label: string;
  value: number | string;
  detail?: string | null;
}

export function WorkspaceStats({ stats }: { stats: WorkspaceStat[] }) {
  if (stats.length === 0) return null;

  return (
    <section aria-label="Workspace figures">
      <dl className="grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 py-3 sm:px-5 sm:py-4 sm:first:pl-0 sm:last:pr-0"
          >
            <dt className="min-w-0 text-sm text-body-secondary">{stat.label}</dt>
            <dd className="shrink-0 text-lg font-semibold leading-none tabular-nums text-accent">
              {stat.value}
            </dd>
            {stat.detail ? (
              <p className="w-full text-xs leading-5 text-body-secondary sm:w-full">
                {stat.detail}
              </p>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
}

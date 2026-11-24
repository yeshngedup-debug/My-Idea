/**
 * Workspace figures with a deliberate typographic rhythm: one leading number,
 * the rest as a compact hairline ledger. Server-only, no icons or charts.
 */
export interface WorkspaceStat {
  label: string;
  value: number | string;
  detail?: string | null;
}

export function WorkspaceStats({ stats }: { stats: WorkspaceStat[] }) {
  const [lead, ...rest] = stats;
  if (!lead) return null;

  return (
    <section
      aria-label="Workspace figures"
      className="border-y border-[#17352b]/10 py-6 sm:py-7"
    >
      <div className="grid grid-cols-12 gap-6 sm:gap-10">
        <div className="col-span-12 min-w-0 sm:col-span-5">
          <p className="text-sm text-[#657069]">{lead.label}</p>
          <p className="mt-1 text-[clamp(2.5rem,6vw,3.5rem)] font-medium leading-none tabular-nums tracking-[-0.03em] text-[#17352b]">
            {lead.value}
          </p>
          {lead.detail ? (
            <p className="mt-2 text-xs leading-5 text-[#657069]">{lead.detail}</p>
          ) : null}
        </div>
        <dl className="col-span-12 min-w-0 sm:col-span-7">
          {rest.map((stat) => (
            <div
              key={stat.label}
              className="flex items-baseline justify-between gap-4 border-b border-[#17352b]/10 py-2.5 last:border-0"
            >
              <dt className="min-w-0 text-sm text-[#657069]">
                {stat.label}
                {stat.detail ? (
                  <span className="ml-2 text-xs text-[#8d948e]">{stat.detail}</span>
                ) : null}
              </dt>
              <dd className="shrink-0 tabular-nums text-lg font-medium tracking-tight text-[#17352b]">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

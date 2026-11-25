/**
 * Workspace figures as quiet cards. The numbers stay legible and tabular, but
 * no single figure dominates the page. Server-only, no icons or charts. Each
 * figure sits in a teal-tinted outer tray with a hairline edge and a white
 * inner core carrying an inset highlight and a soft diffused lift.
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
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="min-w-0 rounded-[1.5rem] border border-[#b9dede]/80 bg-[#dff0f0]/55 p-1.5 shadow-[0_14px_34px_-32px_rgba(11,92,92,0.5)]"
          >
            <div className="rounded-[calc(1.5rem_-_0.375rem)] bg-white px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:px-5 sm:py-5">
              <dt className="text-xs font-medium text-[#356464]">
                {stat.label}
              </dt>
              <dd className="mt-2 text-2xl font-semibold leading-none tabular-nums tracking-tight text-[#0b5c5c]">
                {stat.value}
                {stat.detail ? (
                  <span className="mt-2 block text-xs font-normal leading-5 tracking-normal text-[#356464]">
                    {stat.detail}
                  </span>
                ) : null}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

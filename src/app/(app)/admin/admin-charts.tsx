/**
 * Server-only data visuals for the admin overview.
 *
 * Every figure comes from an existing typed Neon helper in lib/neon-data.ts.
 * Inline SVG + CSS only: no chart package, no client JS, no animation that
 * hides values. Exact numbers remain available as text and in sr-only tables.
 */

type RoleCount = { role: string; count: number };

type Series = {
  key: string;
  label: string;
  color: string;
  pattern: "" | "dots" | "hatch";
};

type Arc = Series & { count: number; length: number; offset: number };

const ROLE_SERIES: Series[] = [
  { key: "student", label: "Students", color: "#17352b", pattern: "" },
  { key: "founder", label: "Founders", color: "#b08947", pattern: "" },
  { key: "admin", label: "Admins", color: "#8d948e", pattern: "dots" },
];

const STAGE_SERIES: Series[] = [
  { key: "open", label: "Open", color: "#b08947", pattern: "" },
  { key: "in_progress", label: "In progress", color: "#17352b", pattern: "" },
  { key: "review", label: "In review", color: "#8d948e", pattern: "hatch" },
  { key: "completed", label: "Completed", color: "#3f6b58", pattern: "" },
];

function share(count: number, total: number): number {
  return total > 0 ? (count / total) * 100 : 0;
}

function roundedShare(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

/** Pattern fills keep series distinguishable without relying on hue alone. */
function ChartDefs() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute">
      <defs>
        <pattern id="admin-chart-dots" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="#fffefa" fillOpacity="0.9" />
        </pattern>
        <pattern
          id="admin-chart-hatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke="#fffefa" strokeOpacity="0.85" strokeWidth="2" />
        </pattern>
      </defs>
    </svg>
  );
}

function SrTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="sr-only">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) =>
                cellIndex === 0 ? (
                  <th key={cellIndex} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={cellIndex}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Swatch({ series }: { series: Series }) {
  return (
    <svg width="12" height="12" aria-hidden="true" focusable="false" className="shrink-0">
      <rect width="12" height="12" rx="2" fill={series.color} />
      {series.pattern ? (
        <rect width="12" height="12" rx="2" fill={`url(#admin-chart-${series.pattern})`} />
      ) : null}
    </svg>
  );
}

/** Donut chart of real profile roles; legend carries exact counts and shares. */
export function RoleDonut({ counts }: { counts: RoleCount[] }) {
  const total = counts.reduce((sum, row) => sum + row.count, 0);
  const byRole = new Map(counts.map((row) => [row.role, row.count]));
  const knownKeys = new Set(ROLE_SERIES.map((series) => series.key));
  const otherCount = counts
    .filter((row) => !knownKeys.has(row.role))
    .reduce((sum, row) => sum + row.count, 0);
  const series: Series[] = otherCount > 0
    ? [
        ...ROLE_SERIES,
        { key: "other", label: "Other roles", color: "#657069", pattern: "hatch" },
      ]
    : ROLE_SERIES;

  const arcs = series.reduce<Arc[]>((built, item) => {
    const count = item.key === "other" ? otherCount : byRole.get(item.key) ?? 0;
    if (count === 0) return built;
    const length = share(count, total);
    const offset = built.reduce((sum, arc) => sum + arc.length, 0);
    return [...built, { ...item, count, length, offset }];
  }, []);

  const countFor = (item: Series) =>
    item.key === "other" ? otherCount : byRole.get(item.key) ?? 0;
  const description = series
    .map(
      (item) =>
        `${item.label} ${countFor(item)} of ${total} (${roundedShare(countFor(item), total)}%)`,
    )
    .join(", ");

  return (
    <figure className="min-w-0 rounded-xl border border-[#ded8cb] bg-[#fffefa] p-4">
      <figcaption className="text-sm font-semibold text-[#17352b]">
        Members by role
      </figcaption>
      <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <svg
          viewBox="0 0 120 120"
          className="h-32 w-32 shrink-0"
          role="img"
          aria-labelledby="admin-role-title admin-role-desc"
          focusable="false"
        >
          <title id="admin-role-title">Members by role</title>
          <desc id="admin-role-desc">{description}</desc>
          <circle cx="60" cy="60" r="46" fill="none" stroke="#eae5d9" strokeWidth="14" />
          <g transform="rotate(-90 60 60)">
            {arcs.map((arc) => (
              <g key={arc.key}>
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke={arc.color}
                  strokeWidth="14"
                  pathLength="100"
                  strokeDasharray={`${arc.length} ${100 - arc.length}`}
                  strokeDashoffset={-arc.offset}
                />
                {arc.pattern ? (
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke={`url(#admin-chart-${arc.pattern})`}
                    strokeWidth="14"
                    pathLength="100"
                    strokeDasharray={`${arc.length} ${100 - arc.length}`}
                    strokeDashoffset={-arc.offset}
                  />
                ) : null}
              </g>
            ))}
          </g>
          <text
            x="60"
            y="58"
            textAnchor="middle"
            className="fill-[#17352b] text-[20px] font-semibold tabular-nums"
          >
            {total}
          </text>
          <text x="60" y="72" textAnchor="middle" className="fill-[#657069] text-[8px]">
            members
          </text>
        </svg>
        <ul className="w-full min-w-0 space-y-1.5">
          {series.map((item) => {
            const count = countFor(item);
            return (
              <li
                key={item.key}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Swatch series={item} />
                  <span className="truncate text-[#4c5a52]">{item.label}</span>
                </span>
                <span className="shrink-0 tabular-nums text-[#17352b]">
                  {count}{" "}
                  <span className="text-[#657069]">
                    ({roundedShare(count, total)}%)
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <SrTable
        caption="Members by role with exact counts and percentages"
        columns={["Role", "Count", "Share"]}
        rows={series.map((item) => {
          const count = countFor(item);
          return [item.label, count, `${roundedShare(count, total)}%`];
        })}
      />
    </figure>
  );
}

/** Hairline horizontal bars of stored project stages; zero counts stay visible as text. */
export function ProjectStageBars({ statuses }: { statuses: string[] }) {
  const counts = new Map<string, number>();
  for (const status of statuses) {
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }
  const total = statuses.length;
  const known = STAGE_SERIES.map((series) => ({
    ...series,
    count: counts.get(series.key) ?? 0,
  }));
  const otherCount = total - known.reduce((sum, row) => sum + row.count, 0);
  const rows =
    otherCount > 0
      ? [
          ...known,
          { key: "other", label: "Other", color: "#657069", pattern: "hatch" as const, count: otherCount },
        ]
      : known;

  return (
    <figure className="min-w-0 rounded-xl border border-[#ded8cb] bg-[#fffefa] p-4">
      <figcaption className="text-sm font-semibold text-[#17352b]">
        Projects by stage
      </figcaption>
      <p className="mt-0.5 text-xs tabular-nums text-[#657069]">
        {total} {total === 1 ? "project" : "projects"} total
      </p>
      <ul className="mt-3 space-y-2.5">
        {rows.map((row) => (
          <li key={row.key}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2 text-xs text-[#4c5a52]">
                <Swatch series={row} />
                <span className="truncate">{row.label}</span>
              </span>
              <span className="shrink-0 text-xs tabular-nums text-[#17352b]">
                {row.count}
              </span>
            </div>
            <div
              aria-hidden="true"
              className="mt-1 h-2 w-full rounded-full border border-[#ded8cb] bg-[#f5f2ea]"
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${share(row.count, total)}%`, backgroundColor: row.color }}
              />
            </div>
          </li>
        ))}
      </ul>
      <SrTable
        caption="Project stages with exact counts and shares"
        columns={["Stage", "Count", "Share"]}
        rows={rows.map((row) => [
          row.label,
          row.count,
          `${roundedShare(row.count, total)}%`,
        ])}
      />
    </figure>
  );
}

const MONTH_COUNT = 6;

function recentMonths(): { key: string; label: string }[] {
  const now = new Date();
  return Array.from({ length: MONTH_COUNT }, (_, index) => {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTH_COUNT - 1 - index), 1),
    );
    return {
      key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }),
    };
  });
}

function monthlyCounts(dates: string[], keys: string[]): number[] {
  const counts = Array<number>(keys.length).fill(0);
  const index = new Map(keys.map((key, i) => [key, i]));
  for (const value of dates) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const position = index.get(key);
    if (position !== undefined) counts[position] += 1;
  }
  return counts;
}

/**
 * Two-series monthly trend. Shown only when at least two of the last six
 * months contain real dated rows; otherwise a short note explains the gap.
 */
export function ActivityTrend({
  projectDates,
  orderDates,
}: {
  projectDates: string[];
  orderDates: string[];
}) {
  const months = recentMonths();
  const keys = months.map((month) => month.key);
  const projects = monthlyCounts(projectDates, keys);
  const orders = monthlyCounts(orderDates, keys);
  const activeMonths = months.filter(
    (_, index) => projects[index] + orders[index] > 0,
  ).length;

  return (
    <figure className="min-w-0 rounded-xl border border-[#ded8cb] bg-[#fffefa] p-4">
      <figcaption className="text-sm font-semibold text-[#17352b]">
        Projects and orders created by month
      </figcaption>
      {activeMonths < 2 ? (
        <p className="mt-2 text-sm leading-6 text-[#657069]">
          {activeMonths === 0
            ? "No dated projects or orders are available for the last six months, so the trend is not shown yet."
            : "Only one month of dated activity is available so far, so the six-month trend is not shown yet."}
        </p>
      ) : (
        <>
          <div className="mt-3 hidden sm:block">
            <svg
              viewBox="0 0 640 150"
              className="block h-auto w-full"
              role="img"
              aria-labelledby="admin-trend-title admin-trend-desc"
              focusable="false"
            >
              <title id="admin-trend-title">Projects and orders created by month</title>
              <desc id="admin-trend-desc">
                {months
                  .map(
                    (month, index) =>
                      `${month.key}: ${projects[index]} projects, ${orders[index]} orders`,
                  )
                  .join("; ")}
              </desc>
              {[0, 0.5, 1].map((position) => {
                const y = 112 - position * 100;
                return (
                  <line
                    key={position}
                    x1="40"
                    x2="620"
                    y1={y}
                    y2={y}
                    stroke="#ded8cb"
                    strokeWidth="1"
                  />
                );
              })}
              {(() => {
                const max = Math.max(1, ...projects, ...orders);
                const pointX = (index: number) => 40 + (index * 580) / (months.length - 1);
                const pointY = (value: number) => 112 - (value / max) * 100;
                const linePoints = (values: number[]) =>
                  values.map((value, index) => `${pointX(index)},${pointY(value)}`).join(" ");
                return (
                  <>
                    <text x="34" y="16" textAnchor="end" className="fill-[#657069] text-[10px] tabular-nums">
                      {max}
                    </text>
                    <text x="34" y="115" textAnchor="end" className="fill-[#657069] text-[10px] tabular-nums">
                      0
                    </text>
                    <polyline points={linePoints(projects)} fill="none" stroke="#17352b" strokeWidth="2" />
                    <polyline
                      points={linePoints(orders)}
                      fill="none"
                      stroke="#b08947"
                      strokeWidth="2"
                      strokeDasharray="5 4"
                    />
                    {projects.map((value, index) => (
                      <circle key={`p-${index}`} cx={pointX(index)} cy={pointY(value)} r="2.5" fill="#17352b" />
                    ))}
                    {orders.map((value, index) => (
                      <circle
                        key={`o-${index}`}
                        cx={pointX(index)}
                        cy={pointY(value)}
                        r="2.5"
                        fill="#fffefa"
                        stroke="#b08947"
                        strokeWidth="1.5"
                      />
                    ))}
                    {months.map((month, index) => (
                      <text
                        key={month.key}
                        x={pointX(index)}
                        y="138"
                        textAnchor="middle"
                        className="fill-[#657069] text-[10px]"
                      >
                        {month.label}
                      </text>
                    ))}
                  </>
                );
              })()}
            </svg>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#4c5a52]">
              <span className="inline-flex items-center gap-1.5">
                <svg width="18" height="8" aria-hidden="true" focusable="false">
                  <line x1="0" y1="4" x2="18" y2="4" stroke="#17352b" strokeWidth="2" />
                </svg>
                Projects
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg width="18" height="8" aria-hidden="true" focusable="false">
                  <line x1="0" y1="4" x2="18" y2="4" stroke="#b08947" strokeWidth="2" strokeDasharray="5 4" />
                </svg>
                Orders
              </span>
            </div>
          </div>
          <ul className="mt-3 space-y-1 sm:hidden">
            {months.map((month, index) => (
              <li
                key={month.key}
                className="flex items-center justify-between gap-3 border-b border-[#ded8cb] py-1.5 text-xs last:border-0"
              >
                <span className="text-[#4c5a52]">{month.label}</span>
                <span className="tabular-nums text-[#17352b]">
                  {projects[index]} projects · {orders[index]} orders
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
      <SrTable
        caption="Projects and orders created in each of the last six months"
        columns={["Month", "Projects", "Orders"]}
        rows={months.map((month, index) => [month.label, projects[index], orders[index]])}
      />
    </figure>
  );
}

export function AdminChartDefs() {
  return <ChartDefs />;
}

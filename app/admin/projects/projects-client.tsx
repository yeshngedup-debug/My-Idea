"use client";

/**
 * Admin project list with a status filter. The page itself was read-only; the
 * filter narrows real stored rows and announces the visible count. Both the
 * mobile list and the desktop table stay in the DOM, as before.
 */
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/interactive/segmented-control";

export interface ProjectRow {
  id: string;
  title: string;
  status: string;
  created_at: string;
  founder_id: string;
  founderName?: string | null;
}

const FILTERS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "review", label: "In review" },
  { value: "completed", label: "Completed" },
] as const;

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  review: "In review",
  completed: "Completed",
};

const STATUS_BADGE: Record<string, string> = {
  open: "border-amber-200 bg-amber-50 text-[#8a5a00]",
  in_progress: "border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]",
  review: "border-[#b23c26]/25 bg-[#b23c26]/8 text-[#b23c26]",
  completed: "border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]",
};

export function ProjectsClient({ rows }: { rows: ProjectRow[] }) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((row) => row.status === filter)),
    [rows, filter],
  );

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#ded8cb] bg-[#fffefa] p-10 text-center">
        <h3 className="mb-2 text-lg font-semibold text-[#17352b]">
          No projects yet
        </h3>
        <p className="text-sm text-[#657069]">
          Projects appear here as soon as founders post them.
        </p>
      </div>
    );
  }

  const date = (value: string) =>
    new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const statusLabel = (status: string) =>
    STATUS_LABEL[status] ?? status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");

  const countLabel =
    filter === "all"
      ? `Showing all ${rows.length} ${rows.length === 1 ? "project" : "projects"}`
      : `Showing ${filtered.length} ${STATUS_LABEL[filter]?.toLowerCase() ?? filter} ${filtered.length === 1 ? "project" : "projects"}`;

  return (
    <div className="space-y-4">
      <SegmentedControl
        options={FILTERS.map((item) => ({ label: item.label, value: item.value }))}
        value={filter}
        onChange={setFilter}
        ariaLabel="Filter projects by status"
      />

      <p role="status" aria-live="polite" className="text-xs text-[#657069]">
        {countLabel}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ded8cb] bg-[#fffefa] p-10 text-center">
          <h3 className="mb-2 text-lg font-semibold text-[#17352b]">
            No {STATUS_LABEL[filter]?.toLowerCase() ?? filter} projects
          </h3>
          <p className="mb-6 text-sm text-[#657069]">
            No stored project is at this stage right now.
          </p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="pressable inline-flex min-h-11 items-center rounded-full border border-[#ded8cb] bg-[#fffefa] px-6 py-3 text-sm font-semibold text-[#17352b] hover:bg-[#eae5d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2"
          >
            Show all projects
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-2.5 sm:hidden">
            {filtered.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-[#ded8cb] bg-[#fffefa] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 truncate text-sm font-semibold text-[#17352b]">
                    {row.title}
                  </h3>
                  <Badge
                    className={`shrink-0 ${STATUS_BADGE[row.status] ?? STATUS_BADGE.open}`}
                  >
                    {statusLabel(row.status)}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-[#657069]">
                  {row.founderName ?? "Unknown founder"} · Posted{" "}
                  {date(row.created_at)}
                </p>
              </li>
            ))}
          </ul>

          <div className="hidden rounded-xl border border-[#ded8cb] bg-[#fffefa] sm:block">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-[72px] z-10 bg-[#f5f2ea] text-xs uppercase tracking-wide text-[#657069]">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold first:rounded-tl-xl"
                  >
                    Project
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Founder
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold last:rounded-tr-xl"
                  >
                    Posted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ded8cb]">
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors duration-150 hover:bg-[#f5f2ea]"
                  >
                    <td className="max-w-xs truncate px-4 py-3.5 font-semibold text-[#17352b]">
                      {row.title}
                    </td>
                    <td className="px-4 py-3.5 text-[#4c5a52]">
                      {row.founderName ?? "Unknown founder"}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        className={STATUS_BADGE[row.status] ?? STATUS_BADGE.open}
                      >
                        {statusLabel(row.status)}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#657069]">
                      {date(row.created_at)}
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

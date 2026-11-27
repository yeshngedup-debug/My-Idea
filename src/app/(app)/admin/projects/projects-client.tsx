"use client";

/**
 * Admin project list with a status filter. The page itself was read-only; the
 * filter narrows real stored rows and shows the visible count. Both the mobile
 * list and the desktop table stay in the DOM, as before.
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatBhutanDate } from "@/lib/format";
import {
  PROJECT_STATUS_LABEL,
  projectStatusLabel,
} from "@/lib/status-labels";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
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
  { value: "open", label: PROJECT_STATUS_LABEL.open },
  { value: "in_progress", label: PROJECT_STATUS_LABEL.in_progress },
  { value: "review", label: PROJECT_STATUS_LABEL.review },
  { value: "completed", label: PROJECT_STATUS_LABEL.completed },
] as const;

const STATUS_BADGE: Record<string, string> = {
  open: "border-[#b9dede] bg-[#eaf6f6] text-[#0b5c5c]",
  in_progress: "border-[#66bfbf]/20 bg-[#0b5c5c]/8 text-[#0b5c5c]",
  review: "border-[#c2004b]/25 bg-[#ff0063]/8 text-[#c2004b]",
  completed: "border-[#66bfbf]/20 bg-[#0b5c5c]/8 text-[#0b5c5c]",
};

const STATUS_DOT: Record<string, string> = {
  open: "bg-[#66bfbf]",
  in_progress: "bg-[#0b5c5c]",
  review: "bg-[#ff0063]",
  completed: "bg-[#356464]",
};

export function ProjectsClient({
  rows,
  loadError,
}: {
  rows: ProjectRow[];
  loadError?: string | null;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((row) => row.status === filter)),
    [rows, filter],
  );

  if (rows.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="sr-only">Project list</h2>
        {loadError ? (
          <ErrorState
            title="Could not load projects"
            description={loadError}
            action={
              <button
                type="button"
                onClick={() => router.refresh()}
                className="pressable inline-flex min-h-11 items-center rounded-md bg-[#ff0063] px-5 py-2.5 text-sm font-semibold text-[#000000] transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-[#d40054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]"
              >
                Try again
              </button>
            }
          />
        ) : (
          <EmptyState
            title="No projects yet"
            description="Projects appear here as soon as founders post them."
          />
        )}
      </div>
    );
  }

  const date = (value: string) => formatBhutanDate(value);
  const statusLabel = (status: string) => projectStatusLabel(status);

  const countLabel =
    filter === "all"
      ? `Showing all ${rows.length} ${rows.length === 1 ? "project" : "projects"}`
      : `Showing ${filtered.length} ${projectStatusLabel(filter).toLowerCase()} ${filtered.length === 1 ? "project" : "projects"}`;

  return (
    <div className="space-y-4">
      <h2 className="sr-only">Project list</h2>
      <SegmentedControl
        options={FILTERS.map((item) => ({ label: item.label, value: item.value }))}
        value={filter}
        onChange={setFilter}
        ariaLabel="Filter projects by status"
      />

      <p className="text-xs text-[#356464]">
        {countLabel}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          title={`No ${projectStatusLabel(filter).toLowerCase()} projects`}
          description="No stored project is at this stage right now."
          action={
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="pressable inline-flex min-h-11 items-center rounded-md border border-[#b9dede] bg-[#ffffff] px-5 py-2.5 text-sm font-semibold text-[#0b5c5c] transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-[#eaf6f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2"
            >
              Show all projects
            </button>
          }
        />
      ) : (
        <>
          <ul className="divide-y divide-[#b9dede] border-y border-[#b9dede] sm:hidden">
            {filtered.map((row) => (
              <li
                key={row.id}
                className="border-b border-[#b9dede] py-3 last:border-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3
                    title={row.title}
                    className="min-w-0 break-words text-sm font-semibold text-[#0b5c5c]"
                  >
                    {row.title}
                  </h3>
                  <Badge
                    className={`shrink-0 gap-1.5 ${STATUS_BADGE[row.status] ?? STATUS_BADGE.open}`}
                  >
                    <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[row.status] ?? STATUS_DOT.open}`} />
                    {statusLabel(row.status)}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-[#356464]">
                  {row.founderName ?? "Unknown founder"} · Posted{" "}
                  {date(row.created_at)}
                </p>
              </li>
            ))}
          </ul>

          <div className="hidden min-w-0 overflow-x-auto border-y border-[#b9dede] sm:block">
            <table className="w-full text-left text-sm" aria-label="All projects by status">
              <thead className="border-b border-[#b9dede] text-xs font-medium text-[#356464]">
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
              <tbody className="divide-y divide-[#b9dede]">
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors duration-150 hover:bg-[#eaf6f6]"
                  >
                    <td
                      title={row.title}
                      className="max-w-xs break-words px-4 py-3.5 font-semibold text-[#0b5c5c]"
                    >
                      {row.title}
                    </td>
                    <td className="px-4 py-3.5 text-[#356464]">
                      {row.founderName ?? "Unknown founder"}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        className={`gap-1.5 ${STATUS_BADGE[row.status] ?? STATUS_BADGE.open}`}
                      >
                        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[row.status] ?? STATUS_DOT.open}`} />
                        {statusLabel(row.status)}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-[#356464]">
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

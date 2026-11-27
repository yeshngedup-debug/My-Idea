"use client";

/**
 * Student applications list with a real status filter.
 * The filter narrows the applications the student already has; nothing here
 * invents status. Each segment is a real button in the Tab order and the
 * result count is announced in a polite live region. The chosen filter is
 * addressable as `?status=` so deep links, reloads and Back keep the same queue.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatBhutanDate } from "@/lib/format";
import {
  APPLICATION_STATUS_LABEL,
  applicationStatusLabel,
} from "@/lib/status-labels";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedControl } from "@/components/interactive/segmented-control";
import {
  StatusTimeline,
  STUDENT_APPLICATION_STEPS,
} from "@/components/ui/status-timeline";

export interface ApplicationRow {
  id: string;
  status: string;
  created_at: string;
  project: { id: string; title: string } | null;
}

const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: APPLICATION_STATUS_LABEL.pending },
  { value: "shortlisted", label: APPLICATION_STATUS_LABEL.shortlisted },
  { value: "accepted", label: APPLICATION_STATUS_LABEL.accepted },
  { value: "rejected", label: APPLICATION_STATUS_LABEL.rejected },
] as const;

const FILTER_VALUES: readonly string[] = FILTERS.map((item) => item.value);

const STATUS_DOT: Record<string, string> = {
  pending: "bg-[#66bfbf]",
  shortlisted: "bg-[#0b5c5c]",
  accepted: "bg-[#0b5c5c]",
  rejected: "bg-[#ff0063]",
};

export function ApplicationsClient({
  rows,
  initialFilter = "all",
}: {
  rows: ApplicationRow[];
  initialFilter?: string;
}) {
  const [filter, setFilter] = useState<string>(initialFilter);
  const pathname = usePathname();

  useEffect(() => {
    function syncFilterFromUrl() {
      const value = new URLSearchParams(window.location.search).get("status");
      setFilter(value && FILTER_VALUES.includes(value) ? value : "all");
    }

    window.addEventListener("popstate", syncFilterFromUrl);
    return () => window.removeEventListener("popstate", syncFilterFromUrl);
  }, []);

  function handleFilterChange(value: string) {
    setFilter(value);
    const params = new URLSearchParams(window.location.search);
    if (value === "all") params.delete("status");
    else params.set("status", value);
    const query = params.toString();
    window.history.pushState(null, "", query ? `${pathname}?${query}` : pathname);
  }

  const filtered = useMemo(
    () =>
      filter === "all" ? rows : rows.filter((row) => row.status === filter),
    [rows, filter],
  );

  if (rows.length === 0) {
    return (
      <EmptyState
        headingLevel="h2"
        title="You haven’t applied to any projects yet"
        description="Browse open projects and apply to ones that match your skills."
        action={
          <Link
            href="/student/projects"
            className="pressable inline-flex min-h-11 items-center justify-center rounded-md bg-cta px-5 py-2.5 text-sm font-semibold text-cta-foreground transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            Browse projects
          </Link>
        }
      />
    );
  }

  const countLabel =
    filter === "all"
      ? `Showing all ${rows.length} ${rows.length === 1 ? "application" : "applications"}`
      : `Showing ${filtered.length} ${applicationStatusLabel(filter).toLowerCase()} ${filtered.length === 1 ? "application" : "applications"}`;

  return (
    <div className="space-y-4">
      <h2 className="sr-only">Your applications by status</h2>
      <SegmentedControl
        options={FILTERS.map((item) => ({ label: item.label, value: item.value }))}
        value={filter}
        onChange={handleFilterChange}
        ariaLabel="Filter applications by status"
      />

      <p className="text-xs text-[#356464]" aria-live="polite">
        {countLabel}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          headingLevel="h2"
          title={`No ${applicationStatusLabel(filter).toLowerCase()} applications`}
          description="None of your applications are at this stage right now."
          action={
            <button
              type="button"
              onClick={() => handleFilterChange("all")}
              className="pressable inline-flex min-h-11 items-center justify-center rounded-md border border-[#b9dede] bg-[#ffffff] px-5 py-2.5 text-sm font-semibold text-[#0b5c5c] transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-[#eaf6f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              Show all applications
            </button>
          }
        />
      ) : (
        <ul className="divide-y divide-[#b9dede] border-y border-[#b9dede]">
          {filtered.map((item) => (
            <li key={item.id} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                <div className="min-w-0 flex-1">
                  {item.project?.id ? (
                    <Link
                      href={`/student/projects/${item.project.id}`}
                      className="inline-flex min-h-11 max-w-full items-center truncate rounded text-sm font-semibold text-[#0b5c5c] transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:text-[#d40054] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    >
                      {item.project.title}
                    </Link>
                  ) : (
                    <p className="truncate text-sm font-semibold text-[#0b5c5c]">
                      {item.project?.title ?? "Project"}
                    </p>
                  )}
                  <p className="mt-1 text-xs tabular-nums text-[#356464]">
                    Applied {formatBhutanDate(item.created_at)}
                  </p>
                </div>
                <Badge className="shrink-0 gap-1.5 border-[#b9dede] bg-[#eaf6f6] text-[#0b5c5c]">
                  <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[item.status] ?? "bg-[#356464]"}`} />
                  {applicationStatusLabel(item.status)}
                </Badge>
              </div>
              <StatusTimeline
                steps={STUDENT_APPLICATION_STEPS}
                status={item.status}
                label={`Application status for ${item.project?.title ?? "project"}`}
                compact
                className="mt-3"
              />
              {item.status === "rejected" && (
                <Link
                  href="/student/projects"
                  className="mt-3 inline-flex min-h-11 items-center rounded text-sm font-semibold text-[#c2004b] transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:text-[#0b5c5c] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  Browse open projects
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

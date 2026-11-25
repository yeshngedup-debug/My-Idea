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
  { value: "pending", label: "Pending" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
] as const;

const FILTER_VALUES: readonly string[] = FILTERS.map((item) => item.value);

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  rejected: "Rejected",
};

const STATUS_DOT: Record<string, string> = {
  pending: "bg-[#b08947]",
  shortlisted: "bg-[#17352b]",
  accepted: "bg-[#17352b]",
  rejected: "bg-[#b23c26]",
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
      <div className="rounded-2xl border border-dashed border-[#ded8cb] bg-[#fffefa] p-10 text-center">
        <h2 className="mb-2 text-lg font-semibold text-[#17352b]">
          You haven&apos;t applied to any projects yet
        </h2>
        <p className="mb-6 text-sm text-[#657069]">
          Browse open projects and apply to ones that match your skills.
        </p>
        <Link
          href="/student/projects"
          className="pressable inline-flex min-h-11 items-center rounded-full bg-[#17352b] px-6 py-3 text-sm font-semibold text-[#fffefa] transition-colors motion-reduce:transition-none! hover:bg-[#244b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2"
        >
          Browse projects
        </Link>
      </div>
    );
  }

  const countLabel =
    filter === "all"
      ? `Showing all ${rows.length} ${rows.length === 1 ? "application" : "applications"}`
      : `Showing ${filtered.length} ${STATUS_LABEL[filter]?.toLowerCase() ?? filter} ${filtered.length === 1 ? "application" : "applications"}`;

  return (
    <div className="space-y-4">
      <h2 className="sr-only">Your applications by status</h2>
      <SegmentedControl
        options={FILTERS.map((item) => ({ label: item.label, value: item.value }))}
        value={filter}
        onChange={handleFilterChange}
        ariaLabel="Filter applications by status"
      />

      <p role="status" aria-live="polite" className="text-xs text-[#657069]">
        {countLabel}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ded8cb] bg-[#fffefa] p-10 text-center">
          <h2 className="mb-2 text-lg font-semibold text-[#17352b]">
            No {STATUS_LABEL[filter]?.toLowerCase() ?? filter} applications
          </h2>
          <p className="mb-6 text-sm text-[#657069]">
            None of your applications are at this stage right now.
          </p>
          <button
            type="button"
            onClick={() => handleFilterChange("all")}
            className="pressable inline-flex min-h-11 items-center rounded-full border border-[#ded8cb] bg-[#fffefa] px-6 py-3 text-sm font-semibold text-[#17352b] transition-colors motion-reduce:transition-none! hover:bg-[#eae5d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2"
          >
            Show all applications
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-[#ded8cb] bg-[#fffefa] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  {item.project?.id ? (
                    <Link
                      href={`/student/projects/${item.project.id}`}
                      className="inline-block max-w-full truncate rounded text-sm font-semibold text-[#17352b] transition-colors motion-reduce:transition-none! hover:text-[#244b3e] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2"
                    >
                      {item.project.title}
                    </Link>
                  ) : (
                    <p className="truncate text-sm font-semibold text-[#17352b]">
                      {item.project?.title ?? "Project"}
                    </p>
                  )}
                  <p className="mt-1 text-xs tabular-nums text-[#657069]">
                    Applied{" "}
                    {new Date(item.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Badge className="shrink-0 gap-1.5 border-[#ded8cb] bg-[#f5f2ea] text-[#17352b]">
                  <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[item.status] ?? "bg-[#657069]"}`} />
                  {STATUS_LABEL[item.status] ?? item.status}
                </Badge>
              </div>
              <StatusTimeline
                steps={STUDENT_APPLICATION_STEPS}
                status={item.status}
                label={`Application status for ${item.project?.title ?? "project"}`}
                compact
              />
              {item.status === "rejected" && (
                <Link
                  href="/student/projects"
                  className="mt-3 inline-flex min-h-9 items-center rounded text-sm font-semibold text-[#b23c26] transition-colors motion-reduce:transition-none! hover:text-[#17352b] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2"
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

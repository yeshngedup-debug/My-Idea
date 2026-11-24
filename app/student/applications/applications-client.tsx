"use client";

/**
 * Student applications list with a real status filter.
 * The filter narrows the applications the student already has; nothing here
 * invents status. Each segment is a real button in the Tab order and the
 * result count is announced in a polite live region.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
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
  project: { title: string } | null;
}

const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
] as const;

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  rejected: "Rejected",
};

export function ApplicationsClient({ rows }: { rows: ApplicationRow[] }) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(
    () =>
      filter === "all" ? rows : rows.filter((row) => row.status === filter),
    [rows, filter],
  );

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#ded8cb] bg-[#fffefa] p-10 text-center">
        <h3 className="mb-2 text-lg font-semibold text-[#17352b]">
          You haven&apos;t applied to any projects yet
        </h3>
        <p className="mb-6 text-sm text-[#657069]">
          Browse open projects and apply to ones that match your skills.
        </p>
        <Link
          href="/student/projects"
          className="pressable inline-flex min-h-11 items-center rounded-full bg-[#17352b] px-6 py-3 text-sm font-bold text-[#fffefa] transition-colors hover:bg-[#244b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2"
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
      <SegmentedControl
        options={FILTERS.map((item) => ({ label: item.label, value: item.value }))}
        value={filter}
        onChange={setFilter}
        ariaLabel="Filter applications by status"
      />

      <p role="status" aria-live="polite" className="text-xs text-[#657069]">
        {countLabel}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ded8cb] bg-[#fffefa] p-10 text-center">
          <h3 className="mb-2 text-lg font-semibold text-[#17352b]">
            No {STATUS_LABEL[filter]?.toLowerCase() ?? filter} applications
          </h3>
          <p className="mb-6 text-sm text-[#657069]">
            None of your applications are at this stage right now.
          </p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="pressable inline-flex min-h-11 items-center rounded-full border border-[#ded8cb] bg-[#fffefa] px-6 py-3 text-sm font-semibold text-[#17352b] hover:bg-[#eae5d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2"
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
                  <p className="truncate text-sm font-semibold text-[#17352b]">
                    {item.project?.title ?? "Project"}
                  </p>
                  <p className="mt-1 text-xs text-[#657069]">
                    Applied{" "}
                    {new Date(item.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <Badge className="shrink-0 border-[#ded8cb] bg-[#f5f2ea] text-[#17352b] capitalize">
                  {item.status.replace("_", " ")}
                </Badge>
              </div>
              <StatusTimeline
                steps={STUDENT_APPLICATION_STEPS}
                status={item.status}
                label={`Application status for ${item.project?.title ?? "project"}`}
                compact
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

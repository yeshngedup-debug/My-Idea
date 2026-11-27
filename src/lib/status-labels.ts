/**
 * One wording per stored status.
 *
 * A status is a fact about the work, not a mood: the same stored value must
 * read the same way in every role, so a student and a founder looking at the
 * same application or project never see two different words for it.
 *
 * The public pages use the same wording (see `/for-students` and
 * `/how-it-works`), so the marketing copy and the product stay aligned.
 */

/** Application statuses: `pending`, `shortlisted`, `accepted`, `rejected`. */
export const APPLICATION_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  rejected: "Rejected",
};

/** Project statuses: `open`, `in_progress`, `review`, `completed`. */
export const PROJECT_STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  review: "In review",
  completed: "Completed",
};

/** Fallback for a status the schema does not know yet: `some_status`. */
function titleCase(status: string): string {
  return (
    status.charAt(0).toUpperCase() +
    status.slice(1).replace(/_/g, " ")
  );
}

/** The label for an application status, shared by every role. */
export function applicationStatusLabel(status: string): string {
  return APPLICATION_STATUS_LABEL[status] ?? titleCase(status);
}

/** The label for a project status, shared by every role. */
export function projectStatusLabel(status: string): string {
  return PROJECT_STATUS_LABEL[status] ?? titleCase(status);
}

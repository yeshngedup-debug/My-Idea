/**
 * Shared presentation conventions for payment surfaces.
 *
 * - en-GB numbers: `1,500` / `1,500.5` (never en-IN `1,00,000`).
 * - en-GB dates: `25 Nov 2026`.
 * - Dates and timestamps rendered during SSR are fixed to UTC and labelled
 *   `UTC` so the server and the first client render agree.
 */
const EN_GB_NUMBER = new Intl.NumberFormat("en-GB");

const EN_GB_UTC_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const EN_GB_UTC_DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

/** Bhutanese ngultrum, with en-GB grouping and a safe fallback. */
export function formatNuAmount(
  value: number | null | undefined,
  fallback = "Amount not set",
): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return `Nu ${EN_GB_NUMBER.format(value)}`;
}

/** Calendar date in UTC, explicitly labelled to avoid local-time ambiguity. */
export function formatEnGbUtcDate(
  value: string,
  fallback = "Date not set",
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return `${EN_GB_UTC_DATE.format(date)} UTC`;
}

/** Timestamp in UTC with an explicit label for hydration stability. */
export function formatEnGbUtcDateTime(
  value: string,
  fallback = "Date not set",
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return `${EN_GB_UTC_DATE_TIME.format(date)} UTC`;
}

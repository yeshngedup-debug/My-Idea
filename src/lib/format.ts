/**
 * Shared presentation conventions for payment and marketplace surfaces.
 *
 * - en-GB numbers: `1,500` / `1,500.5` (never en-IN `1,00,000`).
 * - en-GB dates: `25 Nov 2026`.
 * - Calendar dates are facts, not instants, so they are read directly.
 * - Timestamps are shown in Bhutan local time (UTC+6, no daylight saving)
 *   through a fixed offset, so the server render and the browser hydration
 *   always agree on the calendar day.
 * - The `UTC`-labelled helpers stay for payment surfaces that show a clock
 *   time, where the zone must be explicit.
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

const EN_GB_UTC_DAY_MONTH = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** Bhutan Time is UTC+6 all year; there is no daylight saving to track. */
const BHUTAN_OFFSET_MS = 6 * 60 * 60 * 1000;

/**
 * Parse a date value into an instant that formats to the same calendar day in
 * every host time zone.
 *
 * Date-only values ("YYYY-MM-DD") are calendar facts, not instants, so their
 * parts are read directly; timestamps are rendered in UTC. Without this, the
 * server render and the browser hydration can disagree on the day.
 */
function parseCalendarDate(value: string): Date | null {
  const trimmed = value.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateOnly) {
    const date = new Date(
      Date.UTC(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])),
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Calendar date as `25 Nov 2026`, stable across server and browser time zones. */
export function formatEnGbDate(
  value: string | null | undefined,
  fallback = "Date not set",
): string {
  if (!value) return fallback;
  const date = parseCalendarDate(value);
  if (!date) return fallback;
  return EN_GB_UTC_DATE.format(date);
}

/** Calendar date as `25 Nov`, stable across server and browser time zones. */
export function formatEnGbShortDate(
  value: string | null | undefined,
  fallback = "Date not set",
): string {
  if (!value) return fallback;
  const date = parseCalendarDate(value);
  if (!date) return fallback;
  return EN_GB_UTC_DAY_MONTH.format(date);
}

/**
 * The day a timestamp falls on in Bhutan, as `25 Nov 2026`.
 *
 * The instant is shifted by Bhutan's fixed UTC+6 offset and read in UTC, so
 * the result never depends on the host time zone: the server render and the
 * browser hydration always show the same day for the same row.
 */
export function formatBhutanDate(
  value: string | null | undefined,
  fallback = "Date not set",
): string {
  if (!value) return fallback;
  const date = parseCalendarDate(value);
  if (!date) return fallback;
  return EN_GB_UTC_DATE.format(new Date(date.getTime() + BHUTAN_OFFSET_MS));
}

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

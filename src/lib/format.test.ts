import { describe, it, expect } from "vitest";
import {
  formatBhutanDate,
  formatEnGbDate,
  formatEnGbShortDate,
  formatEnGbUtcDate,
  formatEnGbUtcDateTime,
  formatNuAmount,
} from "./format";

describe("formatNuAmount", () => {
  it("uses en-GB grouping and labels the currency as Nu", () => {
    expect(formatNuAmount(1500)).toBe("Nu 1,500");
    expect(formatNuAmount(1234567)).toBe("Nu 1,234,567");
    expect(formatNuAmount(1500.5)).toBe("Nu 1,500.5");
  });

  it("never renders missing or invalid amounts as undefined or NaN", () => {
    expect(formatNuAmount(null)).toBe("Amount not set");
    expect(formatNuAmount(undefined)).toBe("Amount not set");
    expect(formatNuAmount(Number.NaN)).toBe("Amount not set");
  });
});

describe("UTC date formatters", () => {
  it("formats an order date as 25 Nov 2026 UTC", () => {
    expect(formatEnGbUtcDate("2026-11-25T14:30:00.000Z")).toBe(
      "25 Nov 2026 UTC",
    );
  });

  it("formats an admin timestamp with an explicit UTC label", () => {
    expect(formatEnGbUtcDateTime("2026-11-25T14:30:00.000Z")).toBe(
      "25 Nov 2026, 14:30 UTC",
    );
  });

  it("keeps the UTC calendar date independent of the host time zone", () => {
    expect(formatEnGbUtcDate("2026-01-01T00:30:00Z")).toBe("1 Jan 2026 UTC");
  });

  it("falls back for invalid dates", () => {
    expect(formatEnGbUtcDate("not-a-date")).toBe("Date not set");
    expect(formatEnGbUtcDateTime("not-a-date")).toBe("Date not set");
  });
});

describe("marketplace date formatters", () => {
  it("formats a full date without a timezone suffix", () => {
    expect(formatEnGbDate("2026-11-25T14:30:00.000Z")).toBe("25 Nov 2026");
  });

  it("keeps a date-only value on its own calendar day", () => {
    expect(formatEnGbDate("2026-12-14")).toBe("14 Dec 2026");
    expect(formatEnGbShortDate("2026-12-14")).toBe("14 Dec");
  });

  it("formats a short date from a timestamp", () => {
    expect(formatEnGbShortDate("2026-11-25T14:30:00.000Z")).toBe("25 Nov");
  });

  it("uses the same calendar day whatever the host time zone is", () => {
    expect(formatEnGbDate("2026-01-01T00:30:00Z")).toBe("1 Jan 2026");
  });

  it("falls back for missing or invalid dates", () => {
    expect(formatEnGbDate(null)).toBe("Date not set");
    expect(formatEnGbDate(undefined)).toBe("Date not set");
    expect(formatEnGbDate("not-a-date")).toBe("Date not set");
    expect(formatEnGbShortDate("")).toBe("Date not set");
  });
});

describe("formatBhutanDate", () => {
  it("shows the Bhutan calendar day, not the UTC day", () => {
    // 18:30 UTC is already the next day in Bhutan (UTC+6).
    expect(formatBhutanDate("2026-11-25T18:30:00.000Z")).toBe("26 Nov 2026");
  });

  it("keeps a timestamp on the same day for every host time zone", () => {
    expect(formatBhutanDate("2026-01-01T00:30:00Z")).toBe("1 Jan 2026");
  });

  it("keeps a date-only value on its own calendar day", () => {
    expect(formatBhutanDate("2026-12-14")).toBe("14 Dec 2026");
  });

  it("falls back for missing or invalid dates", () => {
    expect(formatBhutanDate(null)).toBe("Date not set");
    expect(formatBhutanDate(undefined)).toBe("Date not set");
    expect(formatBhutanDate("not-a-date")).toBe("Date not set");
    expect(formatBhutanDate("2026-12-14", "Not set")).toBe("14 Dec 2026");
  });
});

import { describe, it, expect } from "vitest";
import {
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

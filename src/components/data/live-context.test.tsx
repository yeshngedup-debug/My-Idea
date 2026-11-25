import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LiveContextResult, LiveIndicator } from "@/lib/data/world-bank";
import { LiveContext } from "./live-context";

const CHECKED_AT = "2026-04-15T09:00:00.000Z";

const youth: LiveIndicator = {
  code: "SL.UEM.1524.ZS",
  name: "Unemployment, youth total (% of total labor force ages 15-24)",
  value: 12.3,
  year: "2024",
  displayValue: "12.3%",
  seriesNote: "modeled ILO estimate, year 2024",
  sourceId: "world-bank",
  sourceUrl: "https://example.test/world-bank",
};

const healthy: Extract<LiveContextResult, { ok: true }> = {
  ok: true,
  partial: false,
  missing: [],
  errors: [],
  checkedAt: CHECKED_AT,
  fetchedAt: CHECKED_AT,
  sourceUpdatedAt: null,
  sourceUrl: "https://example.test/world-bank",
  sourceLabel: "World Bank API, World Development Indicators",
  sources: [],
  indicators: [youth],
};

const partial: LiveContextResult = {
  ...healthy,
  partial: true,
  missing: ["Life expectancy at birth (years)"],
  // Repeated source messages are possible when several series fail together.
  errors: ["WHO GHO API did not respond.", "WHO GHO API did not respond."],
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("LiveContext partial-data notice", () => {
  it("reports the gaps without hiding figures or controls in the full panel", () => {
    render(<LiveContext initial={partial} />);

    const note = screen
      .getByText("This check is incomplete.")
      .closest('[role="status"]');
    expect(note).toHaveAttribute("aria-live", "polite");
    expect(note).toHaveAttribute("aria-atomic", "true");
    expect(note).toHaveTextContent(
      "Not included in this check: Life expectancy at birth (years).",
    );
    expect(note).toHaveTextContent(
      "Source reports: WHO GHO API did not respond.",
    );
    expect(
      note?.textContent?.match(/WHO GHO API did not respond\./g),
    ).toHaveLength(1);

    expect(screen.getByText("12.3%")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /refresh now/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
    expect(
      screen.queryByText(/auto-refresh temporarily unavailable/i),
    ).not.toBeInTheDocument();
  });

  it("shows the same notice in the compact panel", () => {
    render(<LiveContext initial={partial} variant="compact" />);

    expect(screen.getByText("This check is incomplete.")).toBeInTheDocument();
    expect(screen.getByText("12.3%")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /refresh now/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  });

  it("stays quiet when the server reports complete data", () => {
    render(<LiveContext initial={healthy} />);

    expect(
      screen.queryByText("This check is incomplete."),
    ).not.toBeInTheDocument();
    expect(screen.getByText("12.3%")).toBeInTheDocument();
  });

  it("shows the notice after a refresh returns a partial result", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => partial,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<LiveContext initial={healthy} />);
    expect(
      screen.queryByText("This check is incomplete."),
    ).not.toBeInTheDocument();

    await act(async () => {
      screen.getByRole("button", { name: /refresh now/i }).click();
    });

    expect(
      await screen.findByText("This check is incomplete."),
    ).toBeInTheDocument();
    expect(screen.getByText("12.3%")).toBeInTheDocument();
    expect(
      screen.queryByText(/auto-refresh temporarily unavailable/i),
    ).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/context-data", {
      cache: "no-store",
    });
  });
});

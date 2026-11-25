import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OfflineStatus } from "./offline-status";

const originalOnLine = Object.getOwnPropertyDescriptor(
  window.navigator,
  "onLine",
);

function setOnLine(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value,
    writable: true,
  });
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();

  if (originalOnLine) {
    Object.defineProperty(window.navigator, "onLine", originalOnLine);
  } else {
    Reflect.deleteProperty(window.navigator, "onLine");
  }
});

describe("OfflineStatus", () => {
  it("stays quiet when the browser starts online", () => {
    setOnLine(true);

    render(<OfflineStatus />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("announces an offline browser on mount", async () => {
    setOnLine(false);

    render(<OfflineStatus />);

    const status = await waitFor(() => screen.getByRole("status"));
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent(/offline/i);
    expect(status).not.toHaveTextContent(/queued|saved/i);
  });

  it("switches from offline to a brief back-online status", () => {
    vi.useFakeTimers();
    setOnLine(true);
    render(<OfflineStatus />);

    act(() => {
      setOnLine(false);
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByRole("status")).toHaveTextContent(/offline/i);

    act(() => {
      setOnLine(true);
      window.dispatchEvent(new Event("online"));
    });
    expect(screen.getByRole("status")).toHaveTextContent(/back online/i);

    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

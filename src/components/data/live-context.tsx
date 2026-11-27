"use client";

/**
 * Auto-refreshing official statistics, rendered from server data and checked
 * again by polling. These are annual releases and modeled estimates, not
 * real-time data. "Auto-refreshing" means hourly server revalidation plus
 * 10-minute client polling, with a visible "checked at" timestamp.
 *
 * No number animation is used here. Values render as plain text, so the
 * component behaves the same for readers who prefer reduced motion.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  WORLD_BANK_SOURCE,
  YOUTH_UNEMPLOYMENT,
} from "@/data/landing";
import { cn } from "@/lib/utils";
import type {
  LiveContextResult,
  LiveIndicator,
  LiveSource,
} from "@/lib/data/world-bank";

const POLL_MS = 10 * 60 * 1000;

type LiveContextProps = {
  initial: LiveContextResult;
  variant?: "full" | "compact";
  className?: string;
};

type LiveState = {
  data: LiveContextResult;
  unavailable: boolean;
  now: number;
  paused: boolean;
  refreshing: boolean;
  notice: string | null;
  refresh: () => void;
  togglePaused: () => void;
};

const sourceLink =
  "font-semibold text-cta underline decoration-border underline-offset-4 transition-colors duration-150 ease-[var(--ease-out)] hover:text-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none";

function absoluteLabel(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(iso)) return "time unknown";
  return `${iso.slice(0, 16).replace("T", " ")} UTC`;
}

function relativeLabel(iso: string, now: number): string {
  // `now` starts at the server's checked-at value so SSR and hydration agree.
  // A mount effect swaps in the real clock before the first minute elapses.
  const timestamp = Date.parse(iso);
  if (!Number.isFinite(timestamp)) return "check time unknown";
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60000));
  if (minutes < 1) return "checked just now";
  if (minutes < 60) {
    return `checked ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `checked ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `checked ${days} day${days === 1 ? "" : "s"} ago`;
}

function useLiveContext(initial: LiveContextResult): LiveState {
  const [data, setData] = useState<LiveContextResult>(initial);
  const [unavailable, setUnavailable] = useState(!initial.ok);
  // Seeded from the server value to avoid a hydration mismatch. The initial
  // label reads "checked just now"; the interval advances it after one minute.
  const [now, setNow] = useState<number>(() => {
    const parsed = Date.parse(initial.checkedAt);
    return Number.isFinite(parsed) ? parsed : 0;
  });
  const inFlight = useRef(false);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    setNotice(null);

    try {
      const response = await fetch("/api/context-data", { cache: "no-store" });
      if (!response.ok) throw new Error("refresh failed");
      const next = (await response.json()) as LiveContextResult;

      if (next.ok && next.indicators.length > 0) {
        setData(next);
        setUnavailable(false);
        setNotice("Updated just now");
      } else {
        setUnavailable(true);
        setNotice("Could not check for updates. Showing the last available figures.");
      }
    } catch {
      // Keep the last good figures on screen when a poll fails.
      setUnavailable(true);
      setNotice("Could not check for updates. Showing the last available figures.");
    } finally {
      inFlight.current = false;
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Move to the real clock after hydration, then let the interval update it.
    const frame = window.requestAnimationFrame(() => setNow(Date.now()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const clock = window.setInterval(() => setNow(Date.now()), 60000);
    // Constant dependency arity: `paused` is read from a ref so hydration never
    // sees a different-length dependency array.
    const poll = window.setInterval(() => {
      if (!pausedRef.current) void refresh();
    }, POLL_MS);
    return () => {
      window.clearInterval(clock);
      window.clearInterval(poll);
    };
  }, [refresh]);

  return {
    data,
    unavailable,
    now,
    paused,
    refreshing,
    notice,
    refresh: () => void refresh(),
    togglePaused: () => {
      pausedRef.current = !pausedRef.current;
      setPaused(pausedRef.current);
    },
  };
}

/** WCAG 2.2.2: an auto-updating region needs a keyboard-operable pause. */
function RefreshControls({
  paused,
  refreshing,
  notice,
  onRefresh,
  onToggle,
}: {
  paused: boolean;
  refreshing: boolean;
  notice: string | null;
  onRefresh: () => void;
  onToggle: () => void;
}) {
  const control =
    "inline-flex min-h-11 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-cta transition-colors duration-150 ease-[var(--ease-out)] hover:border-border-strong hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        aria-busy={refreshing}
        className={control}
      >
        {refreshing ? "Refreshing..." : "Refresh now"}
      </button>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={paused}
        className={control}
      >
        {paused ? "Updates paused · Resume" : "Auto-refreshing · Pause"}
      </button>
      <p role="status" aria-live="polite" className="sr-only">
        {notice ?? ""}
      </p>
    </div>
  );
}

function CheckedLabel({
  checkedAt,
  now,
}: {
  checkedAt: string;
  now: number;
}) {
  return (
    <p className="text-xs leading-5 text-muted-foreground">
      <time dateTime={checkedAt}>Checked at {absoluteLabel(checkedAt)}</time>
      <span> · {relativeLabel(checkedAt, now)}</span>
    </p>
  );
}

function SourceList({ sources }: { sources: LiveSource[] }) {
  if (sources.length === 0) return null;

  return (
    <ul className="mt-4 flex flex-wrap gap-x-7 gap-y-2">
      {sources.map((source) => (
        <li key={source.id} className="text-xs leading-5 text-muted-foreground">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className={sourceLink}
          >
            {source.label}
          </a>
          <span>
            {source.sourceUpdatedAt
              ? ` · source updated ${source.sourceUpdatedAt.slice(0, 10)}`
              : " · source time unavailable"}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Quiet fallback for a failed refresh. The last good figures stay on screen;
 * the only action is a small inline refresh, so this never reads as an alarm.
 */
function UnavailableNote({
  onRefresh,
  refreshing,
}: {
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-card px-4 py-2.5 text-xs leading-5 text-muted-foreground"
    >
      <span>Could not check for updates. Showing the last available figures.</span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        aria-busy={refreshing}
        className="inline-flex min-h-6 items-center rounded-sm font-medium text-cta underline underline-offset-2 transition-colors duration-150 ease-[var(--ease-out)] hover:text-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none disabled:cursor-wait disabled:opacity-60"
      >
        {refreshing ? "Refreshing…" : "Refresh"}
      </button>
    </div>
  );
}

/**
 * Quiet note for a partial upstream result. It names only what the data
 * contract reports (`missing` and `errors`) and makes no recovery promise.
 * The available figures stay on screen below the note.
 */
function PartialDataNote({
  missing,
  errors,
}: {
  missing: string[];
  errors: string[];
}) {
  // One failed upstream series can add the same message once per indicator.
  // Show each distinct source message only once to keep the notice short.
  const sourceMessages = Array.from(new Set(errors));

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="mt-6 rounded-lg border border-border bg-card px-4 py-3 text-sm leading-6 text-foreground"
    >
      <p className="font-semibold">This check is incomplete.</p>
      {missing.length > 0 ? (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Not included in this check: {missing.join(", ")}.
        </p>
      ) : null}
      {sourceMessages.length > 0 ? (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Source reports: {sourceMessages.join(" ")}
        </p>
      ) : null}
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Figures that are available are still shown below.
      </p>
    </div>
  );
}

function IndicatorItem({
  indicator,
  compact,
}: {
  indicator: LiveIndicator;
  compact: boolean;
}) {
  return (
    <div className={compact ? "" : "border-t border-border pt-5"}>
      <dt
        className={cn(
          "font-semibold tracking-tight text-foreground",
          compact
            ? "text-2xl leading-none"
            : "text-[clamp(2.25rem,4.5vw,3.5rem)] leading-none",
        )}
      >
        {indicator.displayValue}
      </dt>
      <dd className={cn("mt-3", compact ? "text-xs leading-5" : "text-sm leading-6")}>
        <span className="block font-semibold text-foreground">
          {indicator.name}
        </span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {indicator.seriesNote}
        </span>
      </dd>
    </div>
  );
}

function WhyTwoNumbers({ youth }: { youth: LiveIndicator }) {
  return (
    <div id="why-two-numbers" className="mt-9 border-t border-border pt-6">
      <p className="text-sm font-semibold text-foreground">Why two numbers?</p>
      <p className="mt-2 max-w-3xl text-xs leading-5 text-muted-foreground">
        The press release reports {YOUTH_UNEMPLOYMENT.value} youth unemployment.
        The API series is a modeled ILO estimate of {youth.displayValue} for{" "}
        {youth.year}.
        {youth.relatedObservation
          ? ` The same API series reports ${youth.relatedObservation.displayValue} for ${youth.relatedObservation.year}.`
          : ""}{" "}
        These are different series. The reason for the difference is not
        established here.
      </p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        <a
          href={WORLD_BANK_SOURCE.url}
          target="_blank"
          rel="noopener noreferrer"
          className={sourceLink}
        >
          World Bank April 2026 press release
        </a>
        {" · "}
        <a
          href={youth.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={sourceLink}
        >
          World Bank API series
        </a>
      </p>
    </div>
  );
}

function FullPanel({
  data,
  unavailable,
  now,
  paused,
  refreshing,
  notice,
  refresh,
  togglePaused,
  className,
}: LiveState & { className?: string }) {
  const youth = data.indicators.find(
    (item) => item.code === "SL.UEM.1524.ZS",
  );

  return (
    <section
      id="auto-refreshing-statistics"
      aria-labelledby="auto-refreshing-heading"
      className={cn(
        "border-t border-border bg-background px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20",
        className,
      )}
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <h2
            id="auto-refreshing-heading"
            className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Auto-refreshing official statistics
          </h2>
          <RefreshControls
            paused={paused}
            refreshing={refreshing}
            notice={notice}
            onRefresh={refresh}
            onToggle={togglePaused}
          />
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
          Annual releases and modeled estimates from international datasets.
          This is not a real-time feed. The server refreshes the data hourly and
          this page checks for updates every 10 minutes.
        </p>

        <div className="mt-6">
          <CheckedLabel checkedAt={data.checkedAt} now={now} />
          <SourceList sources={data.sources} />
        </div>

        {unavailable ? (
          <UnavailableNote onRefresh={refresh} refreshing={refreshing} />
        ) : null}

        {data.partial ? (
          <PartialDataNote missing={data.missing} errors={data.errors} />
        ) : null}

        {data.indicators.length > 0 ? (
          <dl className="mt-10 grid gap-8 border-t border-border pt-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.indicators.map((indicator) => (
              <IndicatorItem key={indicator.code} indicator={indicator} compact={false} />
            ))}
          </dl>
        ) : (
          <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
            No official statistics are available right now.
          </p>
        )}

        {youth ? <WhyTwoNumbers youth={youth} /> : null}

        <p className="mt-8 text-xs leading-5 text-muted-foreground">
          This panel uses international datasets, not a live feed from
          Bhutan&apos;s national statistics office. All figures are national
          Bhutan indicators, not platform results.
        </p>
      </div>
    </section>
  );
}

function CompactPanel({
  data,
  unavailable,
  now,
  paused,
  refreshing,
  notice,
  refresh,
  togglePaused,
  className,
}: LiveState & { className?: string }) {
  return (
    <section
      id="auto-refreshing-statistics"
      aria-labelledby="auto-refreshing-compact-heading"
      className={cn(
        "border-y border-border bg-background px-5 py-8 sm:px-8 sm:py-10 lg:px-12",
        className,
      )}
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2
              id="auto-refreshing-compact-heading"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              Auto-refreshing official statistics
            </h2>
            <RefreshControls
              paused={paused}
              refreshing={refreshing}
              notice={notice}
              onRefresh={refresh}
              onToggle={togglePaused}
            />
          </div>
          <CheckedLabel checkedAt={data.checkedAt} now={now} />
        </div>

        {unavailable ? (
          <UnavailableNote onRefresh={refresh} refreshing={refreshing} />
        ) : null}

        {data.partial ? (
          <PartialDataNote missing={data.missing} errors={data.errors} />
        ) : null}

        {data.indicators.length > 0 ? (
          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border pt-6 sm:grid-cols-3 lg:grid-cols-4">
            {data.indicators.map((indicator) => (
              <IndicatorItem key={indicator.code} indicator={indicator} compact />
            ))}
          </dl>
        ) : (
          <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
            No official statistics are available right now.
          </p>
        )}

        <div className="mt-7 border-t border-border pt-5">
          <SourceList sources={data.sources} />
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            These annual dataset figures are separate from the press release
            figure.{" "}
            <a href="#why-two-numbers" className={sourceLink}>
              See the note below on this page
            </a>
            . Not a real-time feed.
          </p>
        </div>
      </div>
    </section>
  );
}

export function LiveContext({ initial, variant = "full", className }: LiveContextProps) {
  const state = useLiveContext(initial);

  return variant === "compact" ? (
    <CompactPanel {...state} className={className} />
  ) : (
    <FullPanel {...state} className={className} />
  );
}

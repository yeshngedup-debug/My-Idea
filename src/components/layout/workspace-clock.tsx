"use client";

/**
 * Quiet local-time readout for the workspace header. Derived from the
 * Synapse Folio reference (live local-time nav readout), rewritten here with
 * no dependency and no animation. Server and first client render show a
 * placeholder, then the effect fills in Thimphu time, so hydration is stable.
 */
import { useEffect, useState } from "react";

const TZ = "Asia/Thimphu";

function localTime() {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: TZ,
    }).format(new Date());
  } catch {
    return "--:--";
  }
}

export function WorkspaceClock() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const tick = () => setTime(localTime());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="hidden shrink-0 flex-col items-end leading-tight xl:flex">
      <span className="text-[10px] text-[#657069]">Local time</span>
      <time
        dateTime={time}
        aria-label="Local time in Thimphu"
        className="text-xs tabular-nums text-[#4c5a52]"
      >
        Thimphu {time}
      </time>
    </span>
  );
}

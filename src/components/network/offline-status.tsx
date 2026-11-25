"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/offline-status.module.css";

type ConnectivityStatus = "offline" | "online";

/** How long the reconnect confirmation stays visible before the notice clears. */
const BACK_ONLINE_DURATION_MS = 2500;

/**
 * Global, non-modal connectivity notice. This only reports browser connectivity;
 * it does not queue mutations or promise offline persistence.
 */
export function OfflineStatus() {
  const [status, setStatus] = useState<ConnectivityStatus | null>(null);

  useEffect(() => {
    let active = true;

    const handleOffline = () => setStatus("offline");
    const handleOnline = () => setStatus("online");

    // Read after mount, off the effect's synchronous path, so the server and
    // first client render agree and hydration stays quiet.
    queueMicrotask(() => {
      if (active && !navigator.onLine) {
        setStatus("offline");
      }
    });

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      active = false;
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    if (status !== "online") {
      return;
    }

    const timeout = window.setTimeout(
      () => setStatus(null),
      BACK_ONLINE_DURATION_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [status]);

  if (!status) {
    return null;
  }

  const message =
    status === "offline"
      ? "You appear to be offline. If a submission fails, try again when you're back online."
      : "You're back online.";

  return (
    <div
      className={styles.notice}
      data-state={status}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className={styles.marker} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

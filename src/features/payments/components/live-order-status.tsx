"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createRealtimeClient, type SealedLiveQuery } from "@neon/realtime/client";
import { RealtimeProvider, useLiveQuery } from "@neon/realtime-react";
import type { LiveOrderRow } from "@/lib/neon-realtime";

type Props = {
  sealedQuery: SealedLiveQuery<LiveOrderRow>;
  initialData: LiveOrderRow[];
  realtimeUrl: string;
  /** Opt-in signal so a host can react to confirmation without a second subscription. */
  onConfirmed?: (confirmed: boolean) => void;
};

const LABELS: Record<string, string> = {
  pending: "Awaiting payment",
  submitted: "Payment being checked",
  confirmed: "Payment confirmed. Admin finalization pending",
  rejected: "Payment rejected",
};

function LiveStatus({
  sealedQuery,
  initialData,
  onConfirmed,
}: Omit<Props, "realtimeUrl">) {
  const refreshQuery = useCallback(async () => {
    const response = await fetch("/api/realtime/orders", { method: "POST" });
    if (!response.ok) throw new Error(`Could not renew (${response.status})`);
    return (await response.json()) as SealedLiveQuery<LiveOrderRow>;
  }, []);

  const { data, status } = useLiveQuery(sealedQuery, { refreshQuery, initialData });
  const latest = data?.[0];
  const confirmed = latest?.status === "confirmed";
  const statusDotClass = confirmed
    ? "bg-cta"
    : latest?.status === "rejected"
      ? "bg-destructive"
      : "bg-border-strong";

  const onConfirmedRef = useRef(onConfirmed);
  useEffect(() => {
    onConfirmedRef.current = onConfirmed;
  }, [onConfirmed]);
  useEffect(() => {
    onConfirmedRef.current?.(confirmed);
  }, [confirmed]);

  return (
    <p
      role="status"
      className="inline-flex min-h-8 items-center gap-2 rounded-lg border border-border bg-card px-3 py-1 text-xs font-medium text-foreground"
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${statusDotClass}`} />
      {latest ? (LABELS[latest.status] ?? latest.status) : "No orders yet"}
      {status === "stale" ? <span className="text-muted-foreground">Updating</span> : null}
    </p>
  );
}

export function LiveOrderStatus({
  sealedQuery,
  initialData,
  realtimeUrl,
  onConfirmed,
}: Props) {
  const [client] = useState(() => createRealtimeClient({ url: realtimeUrl }));

  return (
    <RealtimeProvider client={client}>
      <LiveStatus
        sealedQuery={sealedQuery}
        initialData={initialData}
        onConfirmed={onConfirmed}
      />
    </RealtimeProvider>
  );
}

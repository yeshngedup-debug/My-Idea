"use client";

import { useCallback, useState } from "react";
import { createRealtimeClient, type SealedLiveQuery } from "@neon/realtime/client";
import { RealtimeProvider, useLiveQuery } from "@neon/realtime-react";
import type { LiveOrderRow } from "@/lib/neon-realtime";

type Props = {
  sealedQuery: SealedLiveQuery<LiveOrderRow>;
  initialData: LiveOrderRow[];
  realtimeUrl: string;
};

const LABELS: Record<string, string> = {
  pending: "Awaiting payment",
  submitted: "Payment being checked",
  confirmed: "Payment confirmed. Shortlist unlocked",
  rejected: "Payment rejected",
};

function LiveStatus({
  sealedQuery,
  initialData,
}: Omit<Props, "realtimeUrl">) {
  const refreshQuery = useCallback(async () => {
    const response = await fetch("/api/realtime/orders", { method: "POST" });
    if (!response.ok) throw new Error(`Could not renew (${response.status})`);
    return (await response.json()) as SealedLiveQuery<LiveOrderRow>;
  }, []);

  const { data, status } = useLiveQuery(sealedQuery, { refreshQuery, initialData });
  const latest = data?.[0];

  return (
    <p
      role="status"
      className="inline-flex min-h-8 items-center gap-2 rounded-lg border border-[#17352b]/15 bg-[#fffefa] px-3 py-1 text-xs font-medium text-[#17352b]"
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          latest?.status === "confirmed" ? "bg-[#17352b]" : "bg-[#b23c26]"
        }`}
      />
      {latest ? (LABELS[latest.status] ?? latest.status) : "No orders yet"}
      {status === "stale" ? <span className="text-[#657069]">Updating</span> : null}
    </p>
  );
}

export function LiveOrderStatus({ sealedQuery, initialData, realtimeUrl }: Props) {
  const [client] = useState(() => createRealtimeClient({ url: realtimeUrl }));

  return (
    <RealtimeProvider client={client}>
      <LiveStatus sealedQuery={sealedQuery} initialData={initialData} />
    </RealtimeProvider>
  );
}

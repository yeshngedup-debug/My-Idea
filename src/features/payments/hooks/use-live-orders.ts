'use client';

/**
 * Live founder order status.
 *
 * Wraps the sealed-query subscription with the server-side renew endpoint so
 * any founder page can show payment confirmation without polling. Must be
 * rendered inside a `RealtimeProvider` (as LiveOrderStatus does).
 */
import { useCallback } from 'react';
import type { SealedLiveQuery } from '@neon/realtime/client';
import { useLiveQuery } from '@neon/realtime-react';
import type { LiveOrderRow } from '@/lib/neon-realtime';

export type UseLiveOrdersOptions = {
  sealedQuery: SealedLiveQuery<LiveOrderRow>;
  initialData: LiveOrderRow[];
};

export function useLiveOrders({ sealedQuery, initialData }: UseLiveOrdersOptions) {
  const refreshQuery = useCallback(async () => {
    const response = await fetch('/api/realtime/orders', { method: 'POST' });
    if (!response.ok) throw new Error(`Could not renew (${response.status})`);
    return (await response.json()) as SealedLiveQuery<LiveOrderRow>;
  }, []);

  const { data, status } = useLiveQuery(sealedQuery, { refreshQuery, initialData });
  const orders = data ?? initialData;

  return {
    orders,
    status,
    latestOrder: orders[0] ?? null,
    confirmed: orders[0]?.status === 'confirmed',
  };
}

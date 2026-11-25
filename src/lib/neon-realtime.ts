/**
 * Neon Realtime server setup for the founder shortlist status.
 *
 * The query is sealed with NEON_REALTIME_SECRET and filtered by the verified
 * signed-in user ID. No RLS is involved: authorization happens before sealing,
 * and the sealed query is scoped to that founder's own orders.
 */
import { createRealtime, rawSql } from "@neon/realtime/server";
import type { SealedLiveQuery } from "@neon/realtime/server";

export type LiveOrderRow = {
  id: string;
  status: string;
  package: string;
  project_id: string | null;
  created_at: string;
};

function databaseName(): string {
  const url = process.env.DATABASE_URL;
  if (!url) return "neondb";
  try {
    return new URL(url).pathname.replace(/^\//, "") || "neondb";
  } catch {
    return "neondb";
  }
}

let cachedRealtime: ReturnType<typeof createRealtime> | undefined;

/** Fail closed when the Realtime secret is missing instead of sealing with "". */
function getRealtime(): ReturnType<typeof createRealtime> {
  if (!cachedRealtime) {
    const secret = process.env.NEON_REALTIME_SECRET;
    if (!secret || secret.trim() === "") {
      throw new Error(
        "NEON_REALTIME_SECRET is not set. Run `neon env pull` before using Realtime."
      );
    }
    cachedRealtime = createRealtime({ secret, db: databaseName() });
  }
  return cachedRealtime;
}

export function founderOrdersQuery(founderId: string) {
  return rawSql<LiveOrderRow>(
    `SELECT id::text AS id, status, package, project_id::text AS project_id,
            created_at::text AS created_at
     FROM public.shortlist_orders
     WHERE founder_id = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [founderId]
  );
}

export async function sealFounderOrders(
  founderId: string
): Promise<SealedLiveQuery<LiveOrderRow>> {
  return getRealtime().seal({ query: founderOrdersQuery(founderId) });
}

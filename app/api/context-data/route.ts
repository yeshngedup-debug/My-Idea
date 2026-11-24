/**
 * GET /api/context-data
 *
 * Client refresh endpoint for the auto-refreshing official statistics panel.
 * These are annual releases and modeled estimates, not real-time data.
 * "Auto-refreshing" means hourly server revalidation plus 10-minute client
 * polling. The route response is cached for an hour so `checkedAt` reflects
 * when the upstream data was assembled, not when a client last polled.
 */
import { NextResponse } from "next/server";
import { getLiveContext } from "@/lib/data/world-bank";

export const revalidate = 3600;

export async function GET() {
  const result = await getLiveContext();

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

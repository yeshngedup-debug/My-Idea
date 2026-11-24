/**
 * Health check — GET /api/health
 * Verifies the app can reach Neon Postgres. Used by the keep-alive cron
 * (GitHub Actions) and by any uptime monitor.
 */
import { NextResponse } from 'next/server';
import { pingDatabase } from '@/lib/neon-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const started = Date.now();

  try {
    await pingDatabase();
    const dbLatencyMs = Date.now() - started;

    return NextResponse.json({
      status: 'ok',
      db: 'up',
      provider: 'neon',
      dbLatencyMs,
      checkedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: 'error', db: 'unknown', checkedAt: new Date().toISOString() },
      { status: 503 }
    );
  }
}

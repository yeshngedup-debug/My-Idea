/**
 * Health check — GET /api/health
 * Verifies the app can reach the Supabase database. Used by the
 * keep-alive cron (GitHub Actions) so the free-tier Supabase project
 * never pauses, and by any uptime monitor.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const started = Date.now();

  try {
    const supabase = await createClient();
    // Head request with count — touches the DB without transferring rows
    const { error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    const dbLatencyMs = Date.now() - started;

    if (error) {
      return NextResponse.json(
        { status: 'degraded', db: 'down', error: error.message, checkedAt: new Date().toISOString() },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      db: 'up',
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

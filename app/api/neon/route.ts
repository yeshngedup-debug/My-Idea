import { NextResponse } from "next/server";
import { getNeonStats, getOpenProjects, type NeonProject, type NeonStats } from "@/lib/neon";

export const dynamic = "force-dynamic";

type StatusPayload = {
  stats: NeonStats;
  projects: NeonProject[];
  source: "neon-function" | "direct";
};

/**
 * Public platform status. The Neon Function runs next to the database, so it
 * is the primary source. A direct query keeps the endpoint available while the
 * function is cold or during a function deploy.
 */
function functionUrl(): string | null {
  const branch = process.env.NEON_BRANCH_ID;
  const suffix = process.env.NEON_FUNCTION_HOST_SUFFIX;
  if (!branch || !suffix) return null;
  return `https://${branch}-platform${suffix}/`;
}

async function fromFunction(): Promise<StatusPayload> {
  const url = functionUrl();
  if (!url) throw new Error("Function URL not configured");

  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`Function returned ${response.status}`);

  const data = (await response.json()) as {
    ok?: boolean;
    stats?: NeonStats;
    projects?: NeonProject[];
  };
  if (!data.ok || !data.stats || !data.projects) {
    throw new Error("Function payload invalid");
  }
  return { stats: data.stats, projects: data.projects, source: "neon-function" };
}

async function fromDatabase(): Promise<StatusPayload> {
  const [stats, projects] = await Promise.all([
    getNeonStats(),
    getOpenProjects(),
  ]);
  return { stats, projects, source: "direct" };
}

export async function GET() {
  try {
    let payload: StatusPayload;
    try {
      payload = await fromFunction();
    } catch {
      payload = await fromDatabase();
    }
    return NextResponse.json({ ok: true, ...payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: "Neon query failed", detail: message },
      { status: 503 },
    );
  }
}

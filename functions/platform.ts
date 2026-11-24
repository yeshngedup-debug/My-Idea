/**
 * Neon Function: platform status for the public dashboard.
 *
 * Runs in the database region with DATABASE_URL injected. The Next.js route
 * /api/neon calls this function first and falls back to a direct query, so the
 * public status panel keeps working if the function is cold or unavailable.
 */
import pg from "pg";
import { attachDatabasePool } from "@neon/functions";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
});
attachDatabasePool(pool);

type CountRow = {
  profiles: string;
  projects: string;
  applications: string;
  student_profiles: string;
  shortlists: string;
  orders: string;
};

type ProjectRow = {
  id: string;
  title: string;
  status: string;
  budget_min: string | null;
  budget_max: string | null;
};

const handler = {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (request.method !== "GET" || (pathname !== "/" && pathname !== "/status")) {
      return new Response("Not found", { status: 404 });
    }

    try {
      const counts = await pool.query<CountRow>(`
        select
          (select count(*) from public.profiles)::text as profiles,
          (select count(*) from public.projects)::text as projects,
          (select count(*) from public.applications)::text as applications,
          (select count(*) from public.student_profiles)::text as student_profiles,
          (select count(*) from public.shortlists)::text as shortlists,
          (select count(*) from public.shortlist_orders)::text as orders
      `);
      const open = await pool.query<ProjectRow>(`
        select id, title, status, budget_min, budget_max
        from public.projects where status = 'open' order by created_at desc limit 20
      `);

      const c = counts.rows[0];
      return Response.json(
        {
          ok: true,
          source: "neon-function",
          stats: {
            profiles: Number(c.profiles),
            projects: Number(c.projects),
            applications: Number(c.applications),
            studentProfiles: Number(c.student_profiles),
            shortlists: Number(c.shortlists),
            orders: Number(c.orders),
          },
          projects: open.rows.map((p) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            budgetMin: p.budget_min == null ? null : Number(p.budget_min),
            budgetMax: p.budget_max == null ? null : Number(p.budget_max),
          })),
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch {
      return Response.json(
        { ok: false, error: "status unavailable" },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }
  },
};

export default handler;

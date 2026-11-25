/**
 * Neon Postgres data access (server only).
 *
 * Uses the pooled DATABASE_URL from `neon env pull` / .env.local. The app
 * keeps its existing auth provider; this module only reads/writes application
 * data in Lakebase Postgres. Never import it from a Client Component.
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sqlClient: NeonQueryFunction<false, false> | undefined;

export function getSql(): NeonQueryFunction<false, false> {
  if (!sqlClient) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set. Run `neon env pull`.");
    }
    sqlClient = neon(url);
  }
  return sqlClient;
}

export type NeonStats = {
  profiles: number;
  projects: number;
  applications: number;
  studentProfiles: number;
  shortlists: number;
  orders: number;
};

export async function getNeonStats(): Promise<NeonStats> {
  const sql = getSql();
  const rows = await sql`
    select
      (select count(*) from public.profiles)::int as profiles,
      (select count(*) from public.projects)::int as projects,
      (select count(*) from public.applications)::int as applications,
      (select count(*) from public.student_profiles)::int as student_profiles,
      (select count(*) from public.shortlists)::int as shortlists,
      (select count(*) from public.shortlist_orders)::int as orders
  `;
  const row = rows[0];
  return {
    profiles: Number(row.profiles),
    projects: Number(row.projects),
    applications: Number(row.applications),
    studentProfiles: Number(row.student_profiles),
    shortlists: Number(row.shortlists),
    orders: Number(row.orders),
  };
}

export type NeonProject = {
  id: string;
  title: string;
  status: string;
  budgetMin: number | null;
  budgetMax: number | null;
};

export async function getOpenProjects(): Promise<NeonProject[]> {
  const sql = getSql();
  const rows = await sql`
    select id, title, status, budget_min, budget_max
    from public.projects
    where status = 'open'
    order by created_at desc
    limit 20
  `;
  return rows.map((row) => ({
    id: String(row.id),
    title: String(row.title),
    status: String(row.status),
    budgetMin: row.budget_min == null ? null : Number(row.budget_min),
    budgetMax: row.budget_max == null ? null : Number(row.budget_max),
  }));
}

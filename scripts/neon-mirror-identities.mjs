/**
 * Mirror the local Supabase identities and seeded application data into Neon.
 *
 * Supabase stays the Auth + Storage provider: the auth user IDs are the source
 * of truth for `public.profiles.id`. Application reads/writes use the Neon
 * DATABASE_URL. This script is idempotent and safe to re-run before E2E tests.
 *
 * Usage (DATABASE_URL may be in .env.local):
 *   node scripts/neon-mirror-identities.mjs
 */
import { readFileSync } from "node:fs";
import pg from "pg";
import { neon } from "@neondatabase/serverless";

const { Client } = pg;

// Never echo the connection string — only load it into process.env.
if (!process.env.DATABASE_URL) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const i = line.indexOf("=");
    if (i > 0 && line.slice(0, i).trim() === "DATABASE_URL") {
      process.env.DATABASE_URL = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      break;
    }
  }
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const localUrl =
  process.env.LOCAL_SUPABASE_DB_URL ??
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const sql = neon(process.env.DATABASE_URL);
const local = new Client({ connectionString: localUrl });
await local.connect();

try {
  // 1. Make sure the Neon schema (including uniqueness indexes) is current.
  const schema = readFileSync(new URL("../neon/schema.sql", import.meta.url), "utf8");
  for (const statement of schema.split(";")) {
    const text = statement.trim();
    if (!text || text.split("\n").every((l) => l.trim().startsWith("--"))) continue;
    await sql.query(text, []);
  }

  // 2. Read local identities + data. Local Supabase is the identity provider.
  const { rows: users } = await local.query(`
    select u.id, u.email, coalesce(p.role, u.raw_user_meta_data->>'role', 'student') as role,
           coalesce(p.full_name, u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) as full_name,
           p.college, p.avatar_url
    from auth.users u
    left join public.profiles p on p.id = u.id
    order by u.email
  `);
  if (users.length === 0) throw new Error("No local Supabase auth users found");

  const { rows: students } = await local.query(`
    select id, full_name, college, course, year, skills, bio, availability,
           cv_path, cv_url, rank, verified, contact_email, created_at, updated_at
    from public.student_profiles
  `);
  const { rows: projects } = await local.query(`
    select id, title, description, founder_id, student_id, null::numeric as budget,
           status, created_at, required_skills, duration, budget_min, budget_max,
           work_mode, deadline
    from public.projects
  `);
  const { rows: applications } = await local.query(`
    select id, student_id, project_id, status, created_at from public.applications
  `);
  const { rows: shortlists } = await local.query(`
    select id, founder_id, student_id, status, created_at, project_id,
           coalesce(source, 'admin') as source
    from public.shortlists
  `);
  const { rows: orders } = await local.query(`
    select id, founder_id, project_id, package, amount, status, screenshot_path,
           created_at, confirmed_at
    from public.shortlist_orders
  `);

  const knownIds = users.map((u) => u.id);

  // 3. Remove the placeholder IDs created by the first Neon smoke seed.
  const placeholders = [
    "00000000-0000-0000-0000-000000000001",
    "00000000-0000-0000-0000-000000000002",
    "00000000-0000-0000-0000-000000000003",
    "00000000-0000-0000-0000-000000000004",
  ];
  await sql.query(
    "delete from public.profiles where id = any($1::uuid[])",
    [placeholders]
  );

  // Drop rows whose parent identity no longer exists in Supabase.
  await sql.query("delete from public.profiles where not (id = any($1::uuid[]))", [knownIds]);

  // 4. Upsert real identities.
  for (const u of users) {
    await sql.query(
      `insert into public.profiles (id, role, full_name, college, avatar_url)
       values ($1, $2, $3, $4, $5)
       on conflict (id) do update set
         role = excluded.role, full_name = excluded.full_name,
         college = excluded.college, avatar_url = excluded.avatar_url,
         updated_at = now()`,
      [u.id, u.role, u.full_name, u.college ?? null, u.avatar_url ?? null]
    );
  }

  for (const s of students) {
    await sql.query(
      `insert into public.student_profiles
         (id, full_name, college, course, year, skills, bio, availability,
          cv_path, cv_url, rank, verified, contact_email, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6::text[],$7,$8,$9,$10,$11,$12,$13,$14,$15)
       on conflict (id) do update set
         full_name = excluded.full_name, college = excluded.college,
         course = excluded.course, year = excluded.year, skills = excluded.skills,
         bio = excluded.bio, availability = excluded.availability,
         cv_path = excluded.cv_path, cv_url = excluded.cv_url,
         rank = excluded.rank, verified = excluded.verified,
         contact_email = excluded.contact_email, updated_at = excluded.updated_at`,
      [
        s.id, s.full_name, s.college, s.course, s.year, s.skills ?? [], s.bio,
        s.availability, s.cv_path, s.cv_url, s.rank, s.verified, s.contact_email,
        s.created_at, s.updated_at,
      ]
    );
  }

  // Restore referential rows with their original IDs so signed storage paths
  // (which embed user/order IDs) keep working.
  await sql.query("delete from public.shortlists");
  await sql.query("delete from public.applications");
  await sql.query("delete from public.projects");
  await sql.query("delete from public.shortlist_orders");

  for (const p of projects) {
    await sql.query(
      `insert into public.projects
         (id, title, description, founder_id, student_id, budget, status,
          created_at, required_skills, duration, budget_min, budget_max,
          work_mode, deadline)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9::text[],$10,$11,$12,$13,$14)`,
      [
        p.id, p.title, p.description, p.founder_id, p.student_id, p.budget,
        p.status, p.created_at, p.required_skills ?? [], p.duration,
        p.budget_min, p.budget_max, p.work_mode, p.deadline,
      ]
    );
  }
  for (const a of applications) {
    await sql.query(
      `insert into public.applications (id, student_id, project_id, status, created_at)
       values ($1,$2,$3,$4,$5)
       on conflict (student_id, project_id) do update set status = excluded.status`,
      [a.id, a.student_id, a.project_id, a.status, a.created_at]
    );
  }
  for (const s of shortlists) {
    await sql.query(
      `insert into public.shortlists
         (id, founder_id, student_id, status, created_at, project_id, source)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [s.id, s.founder_id, s.student_id, s.status, s.created_at, s.project_id, s.source]
    );
  }
  for (const o of orders) {
    await sql.query(
      `insert into public.shortlist_orders
         (id, founder_id, project_id, package, amount, status, screenshot_path,
          created_at, confirmed_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        o.id, o.founder_id, o.project_id, o.package, o.amount, o.status,
        o.screenshot_path, o.created_at, o.confirmed_at,
      ]
    );
  }

  // 5. Payment-flow starts from a clean slate: its founder must have no
  //    pre-confirmed order, otherwise the client opens on a later step.
  const paymentFounder = users.find((u) => u.email === "founder.pema@btc-e2e.test");
  if (paymentFounder) {
    await sql.query("delete from public.shortlist_orders where founder_id = $1", [
      paymentFounder.id,
    ]);
  }

  // E2E admin-flow needs a SUBMITTED basic order with a screenshot to
  // confirm; local data may have been confirmed by a previous run.
  const primaryFounder = users.find((u) => u.email === "founder.dorji@btc-e2e.test");
  if (primaryFounder) {
    const { rows: proof } = await local.query(
      "select name from storage.objects where bucket_id = 'payment-screenshots' limit 1"
    );
    const submittedId = "e2e00000-0000-4000-8000-000000000001";
    const existing = await sql.query(
      "select id from public.shortlist_orders where id = $1",
      [submittedId]
    );
    if (existing.length === 0) {
      await sql.query(
        `insert into public.shortlist_orders
           (id, founder_id, project_id, package, amount, status, screenshot_path)
         values ($1, $2, null, 'basic', 750, 'submitted', $3)`,
        [
          submittedId,
          primaryFounder.id,
          proof[0]?.name ? `${primaryFounder.id}/${proof[0].name}` : `${primaryFounder.id}/local-receipt.png`,
        ]
      );
    } else {
      await sql.query(
        `update public.shortlist_orders
         set status = 'submitted', screenshot_path = $2
         where id = $1`,
        [
          submittedId,
          proof[0]?.name ? `${primaryFounder.id}/${proof[0].name}` : `${primaryFounder.id}/local-receipt.png`,
        ]
      );
    }
  }

  const counts = await sql.query(`
    select
      (select count(*) from public.profiles)::int as profiles,
      (select count(*) from public.student_profiles)::int as student_profiles,
      (select count(*) from public.projects)::int as projects,
      (select count(*) from public.applications)::int as applications,
      (select count(*) from public.shortlists)::int as shortlists,
      (select count(*) from public.shortlist_orders)::int as orders
  `);
  console.log("Neon identity mirror complete:", JSON.stringify(counts[0]));
} finally {
  await local.end();
}

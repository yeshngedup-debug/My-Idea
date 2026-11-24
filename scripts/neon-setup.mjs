import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(url);
const schema = await readFile(new URL("../neon/schema.sql", import.meta.url), "utf8");

for (const statement of schema.split(";")) {
  const text = statement.trim();
  if (!text || text.split("\n").every((line) => line.trim().startsWith("--"))) continue;
  await sql.query(text, []);
}
await sql.query("drop table if exists public.ddl_probe, public.ddl_probe2, public.ddl_probe3", []);
console.log("schema applied");

const admin = "00000000-0000-0000-0000-000000000001";
const founder = "00000000-0000-0000-0000-000000000002";
const tashi = "00000000-0000-0000-0000-000000000003";
const pema = "00000000-0000-0000-0000-000000000004";

await sql`
  insert into public.profiles (id, role, full_name, college) values
    (${admin}, 'admin', 'Local Admin', null),
    (${founder}, 'founder', 'Ugyen Dorji', null),
    (${tashi}, 'student', 'Tashi Dorji', 'Royal Thimphu College'),
    (${pema}, 'student', 'Pema Choden', 'Royal Thimphu College')
  on conflict (id) do nothing
`;

await sql`
  insert into public.student_profiles
    (id, full_name, college, course, year, skills, bio, availability, cv_path, rank, verified, contact_email)
  values
    (${tashi}, 'Tashi Dorji', 'Royal Thimphu College', 'BSc Computer Science', '3rd',
      array['React','TypeScript','Node.js'], 'Final-year CS student.', 'weekdays',
      ${tashi + "/demo-cv.pdf"}, 1, true, 'student.tashi@btc-e2e.test'),
    (${pema}, 'Pema Choden', 'Royal Thimphu College', 'BCom Business Analytics', 'Graduate',
      array['SQL','Excel','Power BI'], 'Analytics graduate.', 'weekends',
      ${pema + "/demo-cv.pdf"}, 2, true, 'student.pema@btc-e2e.test')
  on conflict (id) do nothing
`;

const projects = await sql`
  insert into public.projects (title, description, founder_id, required_skills, duration, budget_min, budget_max, work_mode, deadline)
  select 'Student attendance tracker web app',
         'A simple web app for a training centre.',
         ${founder}, array['React','Node.js'], '1 month', 4000, 8000, 'remote', current_date + 30
  where not exists (select 1 from public.projects where title = 'Student attendance tracker web app')
  returning id
`;

const projectId = projects[0]?.id;
if (projectId) {
  await sql`
    insert into public.applications (student_id, project_id, status)
    values (${tashi}, ${projectId}, 'pending')
    on conflict (student_id, project_id) do nothing
  `;
  await sql`
    insert into public.shortlists (founder_id, student_id, project_id, source)
    values (${founder}, ${tashi}, ${projectId}, 'founder')
    on conflict do nothing
  `;
}

await sql`
  insert into public.shortlist_orders (founder_id, package, amount, status, screenshot_path)
  select ${founder}, 'basic', 750, 'submitted', ${founder + "/local-receipt.png"}
  where not exists (
    select 1 from public.shortlist_orders
    where founder_id = ${founder} and status = 'submitted'
  )
`;

const counts = await sql`
  select
    (select count(*) from public.profiles)::int as profiles,
    (select count(*) from public.projects)::int as projects,
    (select count(*) from public.applications)::int as applications,
    (select count(*) from public.student_profiles)::int as student_profiles,
    (select count(*) from public.shortlists)::int as shortlists,
    (select count(*) from public.shortlist_orders)::int as orders
`;
console.log(JSON.stringify(counts[0]));

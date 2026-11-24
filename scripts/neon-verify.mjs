/**
 * Read-only proof that application writes are landing in Neon.
 * Prints counts plus the most recent applications, orders and shortlists.
 * Never prints the connection string or credentials.
 */
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const i = line.indexOf('=');
    if (i > 0 && line.slice(0, i).trim() === 'DATABASE_URL') {
      process.env.DATABASE_URL = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
      break;
    }
  }
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const [counts] = await sql`
  select
    (select count(*) from public.profiles)::int as profiles,
    (select count(*) from public.projects)::int as projects,
    (select count(*) from public.applications)::int as applications,
    (select count(*) from public.student_profiles)::int as student_profiles,
    (select count(*) from public.shortlists)::int as shortlists,
    (select count(*) from public.shortlist_orders)::int as orders
`;
const applications = await sql`
  select p.full_name as student, pr.title as project, a.status, a.created_at
  from public.applications a
  join public.profiles p on p.id = a.student_id
  join public.projects pr on pr.id = a.project_id
  order by a.created_at desc
  limit 5
`;
const orders = await sql`
  select package, status, amount from public.shortlist_orders
  order by created_at desc limit 5
`;
const shortlists = await sql`
  select source, status from public.shortlists
  order by created_at desc limit 5
`;
console.log('NEON_COUNTS=' + JSON.stringify(counts));
console.log('NEON_APPLICATIONS=' + JSON.stringify(applications));
console.log('NEON_ORDERS=' + JSON.stringify(orders));
console.log('NEON_SHORTLISTS=' + JSON.stringify(shortlists));

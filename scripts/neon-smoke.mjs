import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(url);
const rows = await sql`select current_database() as db, current_user as usr, 1 as ok`;
console.log(JSON.stringify(rows));

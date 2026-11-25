/**
 * Typed application-data access on Neon Postgres (server only).
 *
 * Neon Auth owns identity and Neon Object Storage owns private files. Every
 * table read/write goes through this module so authorization is enforced in
 * application code — there is no RLS on the Neon side. Never import this
 * module from a Client Component.
 */
import { getSql } from "@/lib/neon";

export type Role = "student" | "founder" | "admin";

/** Preserves the error codes the database surfaces (e.g. 23505). */
export class NeonDataError extends Error {
  readonly code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "NeonDataError";
    this.code = code;
  }
}

function asError(error: unknown): NeonDataError {
  if (error instanceof NeonDataError) return error;
  const e = error as { message?: string; code?: string };
  return new NeonDataError(e?.message ?? "Database error", e?.code);
}

/** Postgres NUMERIC values arrive as strings through the HTTP driver. */
function num(value: unknown): number | null {
  return value == null ? null : Number(value);
}

function str(value: unknown): string | null {
  return value == null ? null : String(value);
}

/** Keep stored timestamps in a stable ISO shape after a driver round-trip. */
function isoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  const text = String(value);
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? text : parsed.toISOString();
}

function textArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v));
  return [];
}

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export async function getProfileRole(id: string): Promise<Role | null> {
  const sql = getSql();
  try {
    const rows = await sql`select role from public.profiles where id = ${id} limit 1`;
    return (rows[0]?.role as Role | undefined) ?? null;
  } catch (error) {
    throw asError(error);
  }
}

export async function getProfile(
  id: string
): Promise<{ id: string; role: Role; full_name: string | null; created_at: string } | null> {
  const sql = getSql();
  try {
    const rows = await sql`
      select id, role, full_name, created_at
      from public.profiles where id = ${id} limit 1
    `;
    const row = rows[0];
    return row
      ? {
          id: String(row.id),
          role: row.role as Role,
          full_name: str(row.full_name),
          created_at: isoString(row.created_at),
        }
      : null;
  } catch (error) {
    throw asError(error);
  }
}

export async function listProfilesByIds(
  ids: string[]
): Promise<{ id: string; full_name: string | null }[]> {
  if (ids.length === 0) return [];
  const sql = getSql();
  try {
    const rows = await sql`
      select id, full_name from public.profiles where id = any(${ids}::uuid[])
    `;
    return rows.map((r) => ({ id: String(r.id), full_name: str(r.full_name) }));
  } catch (error) {
    throw asError(error);
  }
}

export async function listFounderProfiles(): Promise<
  { id: string; full_name: string | null }[]
> {
  const sql = getSql();
  try {
    const rows = await sql`
      select id, full_name from public.profiles
      where role = 'founder' order by full_name asc nulls last
    `;
    return rows.map((r) => ({ id: String(r.id), full_name: str(r.full_name) }));
  } catch (error) {
    throw asError(error);
  }
}

export async function listRoleCounts(): Promise<{ role: string; count: number }[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      select role, count(*)::int as count from public.profiles group by role
    `;
    return rows.map((r) => ({ role: String(r.role), count: Number(r.count) }));
  } catch (error) {
    throw asError(error);
  }
}

export async function updateProfileFullName(id: string, fullName: string): Promise<void> {
  const sql = getSql();
  try {
    await sql`update public.profiles set full_name = ${fullName}, updated_at = now() where id = ${id}`;
  } catch (error) {
    throw asError(error);
  }
}

/**
 * Signup creates the auth user first; mirror the server-assigned student
 * profile into Neon so role lookups and dashboards agree.
 */
export async function ensureProfile(
  id: string,
  fullName: string | null
): Promise<void> {
  const sql = getSql();
  try {
    await sql`
      insert into public.profiles (id, role, full_name)
      values (${id}, 'student', ${fullName})
      on conflict (id) do nothing
    `;
  } catch (error) {
    throw asError(error);
  }
}

/**
 * Mirror an externally assigned role into Neon. Neon is the source of truth
 * for roles; use this only when an admin changes a role outside the app.
 */
export async function syncProfileRole(
  id: string,
  fullName: string | null,
  role: Role
): Promise<void> {
  const sql = getSql();
  try {
    await sql`
      insert into public.profiles (id, role, full_name)
      values (${id}, ${role}, ${fullName})
      on conflict (id) do update set
        role = excluded.role,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = now()
    `;
  } catch (error) {
    throw asError(error);
  }
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  founder_id: string;
  student_id: string | null;
  budget: number | null;
  budget_min: number | null;
  budget_max: number | null;
  required_skills: string[];
  duration: string | null;
  work_mode: string;
  deadline: string | null;
  status: string;
  created_at: string;
};

function mapProject(r: Record<string, unknown>): ProjectRow {
  return {
    id: String(r.id),
    title: String(r.title),
    description: str(r.description),
    founder_id: String(r.founder_id),
    student_id: str(r.student_id),
    budget: num(r.budget),
    budget_min: num(r.budget_min),
    budget_max: num(r.budget_max),
    required_skills: textArray(r.required_skills),
    duration: str(r.duration),
    work_mode: String(r.work_mode ?? "remote"),
    deadline: str(r.deadline),
    status: String(r.status),
    created_at: isoString(r.created_at),
  };
}

export interface NewProject {
  title: string;
  description: string;
  founderId: string;
  requiredSkills: string[];
  duration: string;
  budgetMin: number;
  budgetMax: number;
  workMode: string;
  deadline: string | null;
}

export async function insertProject(input: NewProject): Promise<{ id: string }> {
  const sql = getSql();
  try {
    const rows = await sql`
      insert into public.projects
        (title, description, founder_id, required_skills, duration,
         budget_min, budget_max, work_mode, deadline, status)
      values
        (${input.title}, ${input.description}, ${input.founderId},
         ${input.requiredSkills}::text[], ${input.duration},
         ${input.budgetMin}, ${input.budgetMax}, ${input.workMode},
         ${input.deadline}, 'open')
      returning id
    `;
    return { id: String(rows[0].id) };
  } catch (error) {
    throw asError(error);
  }
}

export async function getProject(id: string): Promise<ProjectRow | null> {
  const sql = getSql();
  try {
    const rows = await sql`
      select id, title, description, founder_id, student_id, budget,
             budget_min, budget_max, required_skills, duration, work_mode,
             deadline, status, created_at
      from public.projects where id = ${id} limit 1
    `;
    return rows[0] ? mapProject(rows[0] as Record<string, unknown>) : null;
  } catch (error) {
    throw asError(error);
  }
}

export async function updateProjectStatus(
  id: string,
  founderId: string,
  status: string
): Promise<boolean> {
  const sql = getSql();
  try {
    const rows = await sql`
      update public.projects set status = ${status}
      where id = ${id} and founder_id = ${founderId}
      returning id
    `;
    return rows.length > 0;
  } catch (error) {
    throw asError(error);
  }
}

export type OpenProjectRow = Pick<
  ProjectRow,
  | "id"
  | "title"
  | "description"
  | "duration"
  | "work_mode"
  | "budget_min"
  | "budget_max"
  | "required_skills"
  | "deadline"
  | "created_at"
>;

export async function listOpenProjects(): Promise<OpenProjectRow[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      select id, title, description, duration, work_mode, budget_min,
             budget_max, required_skills, deadline, created_at
      from public.projects where status = 'open'
      order by created_at desc
    `;
    return rows.map((r) => mapProject(r as Record<string, unknown>));
  } catch (error) {
    throw asError(error);
  }
}

export async function listProjectsByFounder(
  founderId: string
): Promise<ProjectRow[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      select id, title, description, founder_id, student_id, budget,
             budget_min, budget_max, required_skills, duration, work_mode,
             deadline, status, created_at
      from public.projects where founder_id = ${founderId}
      order by created_at desc
    `;
    return rows.map((r) => mapProject(r as Record<string, unknown>));
  } catch (error) {
    throw asError(error);
  }
}

export async function listProjectStatuses(): Promise<string[]> {
  const sql = getSql();
  try {
    const rows = await sql`select status from public.projects`;
    return rows.map((r) => String(r.status));
  } catch (error) {
    throw asError(error);
  }
}

export async function listAllProjectsWithDetails(): Promise<ProjectRow[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      select id, title, description, founder_id, student_id, budget,
             budget_min, budget_max, required_skills, duration, work_mode,
             deadline, status, created_at
      from public.projects order by created_at desc
    `;
    return rows.map((r) => mapProject(r as Record<string, unknown>));
  } catch (error) {
    throw asError(error);
  }
}

export async function listAllProjects(): Promise<
  { id: string; title: string; founder_id: string }[]
> {
  const sql = getSql();
  try {
    const rows = await sql`
      select id, title, founder_id from public.projects order by created_at desc
    `;
    return rows.map((r) => ({
      id: String(r.id),
      title: String(r.title),
      founder_id: String(r.founder_id),
    }));
  } catch (error) {
    throw asError(error);
  }
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

export type ApplicationRow = {
  id: string;
  student_id: string;
  project_id: string;
  status: string;
  created_at: string;
  project: { id: string; title: string } | null;
  student: StudentProfileRow | null;
};

function mapApplication(r: Record<string, unknown>): ApplicationRow {
  const project = r.project as Record<string, unknown> | null;
  const student = r.student as Record<string, unknown> | null;
  return {
    id: String(r.id),
    student_id: String(r.student_id),
    project_id: String(r.project_id),
    status: String(r.status),
    created_at: isoString(r.created_at),
    project: project
      ? { id: String(project.id), title: String(project.title) }
      : null,
    student: student ? mapStudentProfile(student) : null,
  };
}

export async function insertApplication(
  studentId: string,
  projectId: string
): Promise<void> {
  const sql = getSql();
  try {
    await sql`
      insert into public.applications (student_id, project_id, status)
      values (${studentId}, ${projectId}, 'pending')
    `;
  } catch (error) {
    throw asError(error);
  }
}

export async function getApplication(
  id: string
): Promise<{ id: string; project_id: string } | null> {
  const sql = getSql();
  try {
    const rows = await sql`
      select id, project_id from public.applications where id = ${id} limit 1
    `;
    const row = rows[0];
    return row
      ? { id: String(row.id), project_id: String(row.project_id) }
      : null;
  } catch (error) {
    throw asError(error);
  }
}

export async function updateApplicationStatus(
  id: string,
  status: string
): Promise<boolean> {
  const sql = getSql();
  try {
    // A single statement records the transition with the status it replaced.
    // Re-applying the same status is a no-op and adds no history row.
    const rows = await sql`
      with previous as (
        select status as from_status from public.applications where id = ${id}
      ), changed as (
        update public.applications
        set status = ${status}, updated_at = now()
        where id = ${id} and status is distinct from ${status}
        returning id
      )
      insert into public.application_status_history
        (application_id, from_status, to_status)
      select ${id}, previous.from_status, ${status}
      from previous
      where exists (select 1 from changed)
      returning application_id
    `;
    return rows.length > 0;
  } catch (error) {
    throw asError(error);
  }
}

export async function listStudentApplications(
  studentId: string
): Promise<ApplicationRow[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      select a.id, a.student_id, a.project_id, a.status, a.created_at,
             case when p.id is null then null else json_build_object(
               'id', p.id, 'title', p.title
             ) end as project
      from public.applications a
      left join public.projects p on p.id = a.project_id
      where a.student_id = ${studentId}
      order by a.created_at desc
    `;
    return rows.map((r) => mapApplication(r as Record<string, unknown>));
  } catch (error) {
    throw asError(error);
  }
}

export async function listStudentAppliedProjectIds(
  studentId: string
): Promise<string[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      select project_id from public.applications where student_id = ${studentId}
    `;
    return rows.map((r) => String(r.project_id));
  } catch (error) {
    throw asError(error);
  }
}

export async function listProjectApplicants(
  projectId: string
): Promise<ApplicationRow[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      select a.id, a.status, a.created_at, a.student_id, a.project_id,
             case when sp.id is null then null else json_build_object(
               'id', sp.id, 'full_name', sp.full_name, 'college', sp.college,
               'course', sp.course, 'year', sp.year, 'skills', sp.skills,
               'availability', sp.availability, 'cv_path', sp.cv_path,
               'contact_email', sp.contact_email
             ) end as student
      from public.applications a
      left join public.student_profiles sp on sp.id = a.student_id
      where a.project_id = ${projectId}
      order by a.created_at asc
    `;
    return rows.map((r) => mapApplication(r as Record<string, unknown>));
  } catch (error) {
    throw asError(error);
  }
}

export async function listAllApplicationStudentIds(): Promise<string[]> {
  const sql = getSql();
  try {
    const rows = await sql`select student_id from public.applications`;
    return rows.map((r) => String(r.student_id));
  } catch (error) {
    throw asError(error);
  }
}

/** Relationship check used by the founder shortlist RPC replacement. */
export async function hasApplicationToFounderProject(
  studentId: string,
  founderId: string
): Promise<boolean> {
  const sql = getSql();
  try {
    const rows = await sql`
      select 1 from public.applications a
      join public.projects p on p.id = a.project_id
      where a.student_id = ${studentId} and p.founder_id = ${founderId}
      limit 1
    `;
    return rows.length > 0;
  } catch (error) {
    throw asError(error);
  }
}

// ---------------------------------------------------------------------------
// Student profiles
// ---------------------------------------------------------------------------

export type StudentProfileRow = {
  id: string;
  full_name: string | null;
  college: string | null;
  course: string | null;
  year: string | null;
  skills: string[];
  bio: string | null;
  availability: string | null;
  cv_path: string | null;
  cv_url: string | null;
  rank: number | null;
  verified: boolean;
  contact_email: string | null;
  created_at: string;
  updated_at: string;
};

function mapStudentProfile(r: Record<string, unknown>): StudentProfileRow {
  return {
    id: String(r.id),
    full_name: str(r.full_name),
    college: str(r.college),
    course: str(r.course),
    year: str(r.year),
    skills: textArray(r.skills),
    bio: str(r.bio),
    availability: str(r.availability),
    cv_path: str(r.cv_path),
    cv_url: str(r.cv_url),
    rank: r.rank == null ? null : Number(r.rank),
    verified: Boolean(r.verified),
    contact_email: str(r.contact_email),
    created_at: isoString(r.created_at),
    updated_at: isoString(r.updated_at),
  };
}

/** Fields needed by the founder directory; deliberately excludes CV/PII. */
export type BrowseStudentRow = Pick<
  StudentProfileRow,
  "id" | "full_name" | "college" | "course" | "year" | "skills" | "bio" | "availability"
>;

export interface StudentProfileInput {
  id: string;
  full_name: string;
  college: string | null;
  course: string | null;
  year: string | null;
  skills: string[];
  bio: string | null;
  availability: string | null;
  contact_email: string | null;
  updated_at: string;
}

export async function upsertStudentProfile(
  input: StudentProfileInput
): Promise<void> {
  const sql = getSql();
  try {
    await sql`
      insert into public.student_profiles
        (id, full_name, college, course, year, skills, bio, availability,
         contact_email, updated_at)
      values
        (${input.id}, ${input.full_name}, ${input.college}, ${input.course},
         ${input.year}, ${input.skills}::text[], ${input.bio},
         ${input.availability}, ${input.contact_email}, ${input.updated_at})
      on conflict (id) do update set
        full_name = excluded.full_name,
        college = excluded.college,
        course = excluded.course,
        year = excluded.year,
        skills = excluded.skills,
        bio = excluded.bio,
        availability = excluded.availability,
        contact_email = excluded.contact_email,
        updated_at = excluded.updated_at
    `;
  } catch (error) {
    throw asError(error);
  }
}

export async function setStudentProfileCv(
  id: string,
  cvPath: string,
  updatedAt: string
): Promise<void> {
  const sql = getSql();
  try {
    await sql`
      insert into public.student_profiles (id, cv_path, cv_url, updated_at)
      values (${id}, ${cvPath}, null, ${updatedAt})
      on conflict (id) do update set
        cv_path = excluded.cv_path,
        cv_url = null,
        updated_at = excluded.updated_at
    `;
  } catch (error) {
    throw asError(error);
  }
}

export async function getStudentProfile(
  id: string
): Promise<StudentProfileRow | null> {
  const sql = getSql();
  try {
    const rows = await sql`
      select id, full_name, college, course, year, skills, bio, availability,
             cv_path, cv_url, rank, verified, contact_email, created_at, updated_at
      from public.student_profiles where id = ${id} limit 1
    `;
    return rows[0] ? mapStudentProfile(rows[0] as Record<string, unknown>) : null;
  } catch (error) {
    throw asError(error);
  }
}

export async function listStudentProfiles(
  ids: string[]
): Promise<StudentProfileRow[]> {
  if (ids.length === 0) return [];
  const sql = getSql();
  try {
    const rows = await sql`
      select id, full_name, college, course, year, skills, bio, availability,
             cv_path, cv_url, rank, verified, contact_email, created_at, updated_at
      from public.student_profiles where id = any(${ids}::uuid[])
    `;
    return rows.map((r) => mapStudentProfile(r as Record<string, unknown>));
  } catch (error) {
    throw asError(error);
  }
}

export async function listBrowseableStudents(): Promise<BrowseStudentRow[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      select id, full_name, college, course, year, skills, bio, availability
      from public.student_profiles
      where cv_path is not null
        and full_name is not null
        and college is not null
        and cardinality(skills) > 0
      order by updated_at desc
    `;
    return rows.map((r) => ({
      id: String(r.id),
      full_name: str(r.full_name),
      college: str(r.college),
      course: str(r.course),
      year: str(r.year),
      skills: textArray(r.skills),
      bio: str(r.bio),
      availability: str(r.availability),
    }));
  } catch (error) {
    throw asError(error);
  }
}

export async function listAdminStudents(): Promise<StudentProfileRow[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      select id, full_name, college, course, year, skills, bio, availability,
             cv_path, cv_url, rank, verified, contact_email, created_at, updated_at
      from public.student_profiles
      order by rank asc nulls last, full_name asc nulls last
    `;
    return rows.map((r) => mapStudentProfile(r as Record<string, unknown>));
  } catch (error) {
    throw asError(error);
  }
}

export async function setStudentRank(
  id: string,
  rank: number | null
): Promise<void> {
  const sql = getSql();
  try {
    await sql`update public.student_profiles set rank = ${rank} where id = ${id}`;
  } catch (error) {
    throw asError(error);
  }
}

export async function setStudentVerified(
  id: string,
  verified: boolean
): Promise<void> {
  const sql = getSql();
  try {
    await sql`update public.student_profiles set verified = ${verified} where id = ${id}`;
  } catch (error) {
    throw asError(error);
  }
}

// ---------------------------------------------------------------------------
// Shortlists
// ---------------------------------------------------------------------------

export type ShortlistRow = {
  id: string;
  founder_id: string;
  student_id: string;
  project_id: string | null;
  status: string;
  source: string;
  created_at: string;
};

function mapShortlist(r: Record<string, unknown>): ShortlistRow {
  return {
    id: String(r.id),
    founder_id: String(r.founder_id),
    student_id: String(r.student_id),
    project_id: str(r.project_id),
    status: String(r.status),
    source: String(r.source ?? "admin"),
    created_at: isoString(r.created_at),
  };
}

/**
 * Application-code implementation of a shortlist request. It rechecks the
 * relationship and keeps the same "No relationship" signal.
 */
export async function requestShortlist(
  founderId: string,
  studentId: string,
  projectId: string | null
): Promise<void> {
  const sql = getSql();
  try {
    const hasApplication = await hasApplicationToFounderProject(
      studentId,
      founderId
    );
    let hasOrder = false;
    if (!hasApplication) {
      const orderRows = await sql`
        select project_id from public.shortlist_orders
        where founder_id = ${founderId} and status = 'confirmed'
      `;
      hasOrder = orderRows.some((o) => o.project_id == null);
      if (!hasOrder && projectId) {
        hasOrder = orderRows.some((o) => String(o.project_id) === projectId);
      }
    }
    if (!hasApplication && !hasOrder) {
      throw new NeonDataError("No relationship with this student");
    }

    // A founder's general shortlist row is idempotent (source = 'founder').
    if (projectId == null) {
      const existing = await sql`
        select id from public.shortlists
        where founder_id = ${founderId} and student_id = ${studentId}
          and project_id is null and source = 'founder'
        limit 1
      `;
      if (existing.length > 0) return;
    }

    if (projectId != null) {
      const existingProjectRows = await sql`
        select id from public.shortlists
        where founder_id = ${founderId} and student_id = ${studentId}
          and project_id = ${projectId} and source = 'founder'
        limit 1
      `;
      if (existingProjectRows.length > 0) {
        await sql`
          update public.shortlists set status = 'requested'
          where founder_id = ${founderId} and student_id = ${studentId}
            and project_id = ${projectId} and source = 'founder'
        `;
        return;
      }
    }

    await sql`
      insert into public.shortlists (founder_id, student_id, project_id, status, source)
      values (${founderId}, ${studentId}, ${projectId}, 'requested', 'founder')
    `;
  } catch (error) {
    throw asError(error);
  }
}

/** General founder requests only; admin and project rows are separate scopes. */
export async function getShortlist(
  founderId: string,
  studentId: string
): Promise<{ id: string } | null> {
  const sql = getSql();
  try {
    const rows = await sql`
      select id from public.shortlists
      where founder_id = ${founderId} and student_id = ${studentId}
        and source = 'founder' and project_id is null
      limit 1
    `;
    return rows[0] ? { id: String(rows[0].id) } : null;
  } catch (error) {
    throw asError(error);
  }
}

export async function listShortlistedStudentIds(
  founderId: string
): Promise<string[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      select student_id from public.shortlists
      where founder_id = ${founderId}
        and source = 'founder' and project_id is null
    `;
    return rows.map((r) => String(r.student_id));
  } catch (error) {
    throw asError(error);
  }
}

export async function listFounderShortlists(
  founderId: string
): Promise<ShortlistRow[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      select id, founder_id, student_id, project_id, status, source, created_at
      from public.shortlists where founder_id = ${founderId}
      order by created_at asc
    `;
    return rows.map((r) => mapShortlist(r as Record<string, unknown>));
  } catch (error) {
    throw asError(error);
  }
}

/** Admin regeneration: only admin-sourced rows for this scope are replaced. */
export async function replaceAdminShortlist(
  founderId: string,
  projectId: string | null,
  studentIds: string[]
): Promise<void> {
  const sql = getSql();
  try {
    // Upsert the desired rows, then remove stale ones in the same transaction.
    // A DELETE and INSERT in one statement is unsafe here: the unique indexes
    // are checked against the pre-statement snapshot, so re-adding a row that
    // already existed collides. ON CONFLICT handles existing rows per row; the
    // transaction guarantees a failed delete rolls back the upsert.
    if (projectId) {
      await sql.transaction((tx) => [
        tx`
          insert into public.shortlists
            (founder_id, student_id, project_id, status, source)
          select ${founderId}, student_id::uuid, ${projectId}, 'requested', 'admin'
          from unnest(${studentIds}::uuid[]) as student_id
          on conflict (founder_id, student_id, project_id)
            where project_id is not null
          do update set status = 'requested'
        `,
        tx`
          delete from public.shortlists
          where founder_id = ${founderId} and source = 'admin'
            and project_id = ${projectId}
            and student_id <> all(${studentIds}::uuid[])
        `,
      ]);
    } else {
      await sql.transaction((tx) => [
        tx`
          insert into public.shortlists
            (founder_id, student_id, project_id, status, source)
          select ${founderId}, student_id::uuid, null, 'requested', 'admin'
          from unnest(${studentIds}::uuid[]) as student_id
          on conflict (founder_id, student_id, source)
            where project_id is null
          do update set status = 'requested'
        `,
        tx`
          delete from public.shortlists
          where founder_id = ${founderId} and source = 'admin'
            and project_id is null
            and student_id <> all(${studentIds}::uuid[])
        `,
      ]);
    }
  } catch (error) {
    throw asError(error);
  }
}

export async function hasShortlistWithOrder(
  founderId: string,
  studentId: string,
  generalUnlocked: boolean,
  confirmedProjectIds: string[]
): Promise<boolean> {
  if (!generalUnlocked && confirmedProjectIds.length === 0) return false;
  const sql = getSql();
  try {
    if (generalUnlocked) {
      const rows = await sql`
        select id from public.shortlists
        where student_id = ${studentId} and founder_id = ${founderId} limit 1
      `;
      return rows.length > 0;
    }
    const rows = await sql`
      select id from public.shortlists
      where student_id = ${studentId} and founder_id = ${founderId}
        and project_id = any(${confirmedProjectIds}::uuid[])
      limit 1
    `;
    return rows.length > 0;
  } catch (error) {
    throw asError(error);
  }
}

// ---------------------------------------------------------------------------
// Shortlist orders
// ---------------------------------------------------------------------------

export type OrderRow = {
  id: string;
  founder_id: string;
  project_id: string | null;
  package: string;
  amount: number | null;
  status: string;
  screenshot_path: string | null;
  created_at: string;
  confirmed_at: string | null;
};

function mapOrder(r: Record<string, unknown>): OrderRow {
  return {
    id: String(r.id),
    founder_id: String(r.founder_id),
    project_id: str(r.project_id),
    package: String(r.package),
    amount: num(r.amount),
    status: String(r.status),
    screenshot_path: str(r.screenshot_path),
    created_at: isoString(r.created_at),
    confirmed_at: r.confirmed_at == null ? null : isoString(r.confirmed_at),
  };
}

export async function insertOrder(input: {
  founderId: string;
  projectId: string | null;
  package: string;
  amount: number;
}): Promise<{ id: string }> {
  const sql = getSql();
  try {
    const rows = await sql`
      insert into public.shortlist_orders
        (founder_id, project_id, package, amount, status)
      select ${input.founderId}, ${input.projectId}, ${input.package}, ${input.amount}, 'pending'
      where ${input.projectId} is null
         or exists (
           select 1 from public.projects
           where id = ${input.projectId} and founder_id = ${input.founderId}
         )
      returning id
    `;
    const row = rows[0];
    if (!row) {
      throw new NeonDataError("Project not found for this founder.");
    }
    return { id: String(row.id) };
  } catch (error) {
    throw asError(error);
  }
}

export async function getOrder(id: string): Promise<OrderRow | null> {
  const sql = getSql();
  try {
    const rows = await sql`
      select id, founder_id, project_id, package, amount, status,
             screenshot_path, created_at, confirmed_at
      from public.shortlist_orders where id = ${id} limit 1
    `;
    return rows[0] ? mapOrder(rows[0] as Record<string, unknown>) : null;
  } catch (error) {
    throw asError(error);
  }
}

export async function setOrderScreenshot(
  id: string,
  screenshotPath: string
): Promise<void> {
  const sql = getSql();
  try {
    const rows = await sql`
      update public.shortlist_orders
      set screenshot_path = ${screenshotPath}, status = 'submitted'
      where id = ${id} and status in ('pending', 'submitted')
      returning id
    `;
    if (rows.length === 0) {
      throw new Error("This order can no longer accept a screenshot.");
    }
  } catch (error) {
    throw asError(error);
  }
}

export async function setOrderStatus(
  id: string,
  status: "confirmed" | "rejected",
  confirmedAt?: string
): Promise<void> {
  const sql = getSql();
  const nextStatus = status === "confirmed" ? "confirmed" : "rejected";
  try {
    // Only a payment still awaiting review may be confirmed or rejected.
    // The guard lives in the UPDATE, not just the action, so a stale page
    // cannot confirm an already rejected order.
    const rows = await sql`
      update public.shortlist_orders
      set status = ${nextStatus},
          confirmed_at = case
            when ${nextStatus} = 'confirmed'
            then ${confirmedAt ?? new Date().toISOString()}
            else confirmed_at
          end
      where id = ${id}
        and status in ('pending', 'submitted')
      returning id
    `;
    if (rows.length === 0) {
      throw new Error("This order can no longer be reviewed.");
    }
  } catch (error) {
    throw asError(error);
  }
}

export async function listOrders(): Promise<OrderRow[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      select id, founder_id, project_id, package, amount, status,
             screenshot_path, created_at, confirmed_at
      from public.shortlist_orders order by created_at desc
    `;
    return rows.map((r) => mapOrder(r as Record<string, unknown>));
  } catch (error) {
    throw asError(error);
  }
}

export async function listFounderOrders(founderId: string): Promise<OrderRow[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      select id, founder_id, project_id, package, amount, status,
             screenshot_path, created_at, confirmed_at
      from public.shortlist_orders where founder_id = ${founderId}
      order by created_at desc
    `;
    return rows.map((r) => mapOrder(r as Record<string, unknown>));
  } catch (error) {
    throw asError(error);
  }
}

export async function listConfirmedOrderProjectIds(
  founderId: string
): Promise<{ projectId: string | null }[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      select project_id from public.shortlist_orders
      where founder_id = ${founderId} and status = 'confirmed'
    `;
    return rows.map((r) => ({ projectId: str(r.project_id) }));
  } catch (error) {
    throw asError(error);
  }
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export async function pingDatabase(): Promise<void> {
  const sql = getSql();
  await sql`select 1`;
}

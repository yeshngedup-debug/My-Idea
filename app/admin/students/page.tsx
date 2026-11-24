/**
 * Admin — Students management. Rank, verify profiles, select for shortlist.
 * Server loads students (with application counts), founders and projects,
 * then hands them to the interactive AdminStudentsClient.
 */
import { createClient } from "@/lib/supabase/server";
import {
  AdminStudentsClient,
  type AdminStudent,
} from "./admin-students-client";

export const metadata = { title: "Students | Admin | Bhutan Tech Connect" };

export default async function AdminStudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let students: AdminStudent[] = [];
  let founders: { id: string; full_name: string | null }[] = [];
  let projects: { id: string; title: string; founder_id: string }[] = [];

  if (user) {
    // Independent lookups — one round-trip.
    const [sp, apps, f, p] = await Promise.all([
      supabase
        .from("student_profiles")
        .select(
          "id, full_name, college, course, year, skills, bio, availability, cv_path, rank, verified, contact_email",
        )
        .order("rank", { ascending: true, nullsFirst: false }),
      supabase.from("applications").select("student_id"),
      supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "founder")
        .order("full_name", { ascending: true }),
      supabase
        .from("projects")
        .select("id, title, founder_id")
        .order("created_at", { ascending: false }),
    ]);

    // Application counts per student.
    const counts = new Map<string, number>();
    for (const a of apps.data ?? []) {
      counts.set(
        a.student_id as string,
        (counts.get(a.student_id as string) ?? 0) + 1,
      );
    }

    students = ((sp.data as unknown as AdminStudent[]) ?? []).map((s) => ({
      ...s,
      applications: counts.get(s.id) ?? 0,
    }));

    founders = (f.data as { id: string; full_name: string | null }[]) ?? [];
    projects =
      (p.data as { id: string; title: string; founder_id: string }[]) ?? [];
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold tracking-tight text-[#17352b] sm:text-3xl">
          Students
        </h2>

        <div className="mt-6 rounded-2xl border border-[#ded8cb] bg-[#f5f2ea] p-4 sm:p-6">
          <AdminStudentsClient
            students={students}
            founders={founders}
            projects={projects}
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Admin Payments — confirm or reject shortlist orders.
 * Server loads orders + founder names + project titles + fresh screenshot links,
 * then hands them to the interactive PaymentsClient.
 */
import { createClient } from "@/lib/supabase/server";
import { PaymentsClient, type AdminOrder } from "./payments-client";

export const metadata = { title: "Payments | Admin | Bhutan Tech Connect" };

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  const { data: o } = await supabase
    .from("shortlist_orders")
    .select(
      "id, founder_id, project_id, package, amount, status, screenshot_path, created_at",
    )
    .order("created_at", { ascending: false });

  const rows = (o ?? []) as unknown as AdminOrder[];

  // Batch-load display names — never issue .in('id', []) on an empty list.
  const founderIds = [...new Set(rows.map((r) => r.founder_id))];
  const projectIds = [
    ...new Set(rows.map((r) => r.project_id).filter((v): v is string => !!v)),
  ];

  const [fpRes, pjRes] = await Promise.all([
    founderIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", founderIds)
      : Promise.resolve({
          data: [] as { id: string; full_name: string | null }[],
        }),
    projectIds.length
      ? supabase.from("projects").select("id, title").in("id", projectIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);

  const founderNames = new Map(
    (fpRes.data ?? []).map((f) => [
      f.id as string,
      f.full_name as string | null,
    ]),
  );
  const projectTitles = new Map(
    (pjRes.data ?? []).map((p) => [p.id as string, p.title as string]),
  );

  // Each proof needs a fresh short-lived signed URL (1 hour).
  const orders: AdminOrder[] = await Promise.all(
    rows.map(async (row) => {
      let screenshotUrl: string | null = null;
      if (row.screenshot_path) {
        const { data: signed } = await supabase.storage
          .from("payment-screenshots")
          .createSignedUrl(row.screenshot_path, 3600);
        screenshotUrl = signed?.signedUrl ?? null;
      }
      return {
        ...row,
        founderName: founderNames.get(row.founder_id) ?? null,
        projectTitle: row.project_id
          ? projectTitles.get(row.project_id) ?? null
          : null,
        screenshotUrl,
      };
    }),
  );

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold tracking-tight text-[#17352b] sm:text-3xl">
          Payments
        </h2>

        <div className="mt-6 rounded-2xl border border-[#ded8cb] bg-[#f5f2ea] p-4 sm:p-6">
          <PaymentsClient orders={orders} />
        </div>
      </div>
    </section>
  );
}

/** Renew the founder's sealed shortlist-order query. */
import { createClient } from "@/lib/supabase/server";
import { getProfileRole } from "@/lib/neon-data";
import { sealFounderOrders } from "@/lib/neon-realtime";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getProfileRole(user.id);
  if (role !== "founder") return Response.json({ error: "Forbidden" }, { status: 403 });

  const sealed = await sealFounderOrders(user.id);
  return Response.json(sealed, { headers: { "Cache-Control": "no-store" } });
}

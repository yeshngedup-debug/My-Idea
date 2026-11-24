/**
 * Supabase Client for Server (Server Component / API Routes)
 *
 * Uses the @supabase/ssr v0.12+ getAll/setAll cookie API.
 *
 * Type-safe via the generated Database type (see types/database.ts).
 * Once `types/database.ts` is generated from your Supabase schema,
 * uncomment the Database import and the <Database> type argument below.
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { validateEnv } from '@/lib/env';

validateEnv();

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    // import { Database } from '@/types/database';
    // createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore
            // when proxy refreshes sessions.
          }
        },
      },
    }
  );
}

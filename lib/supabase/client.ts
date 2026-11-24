/**
 * Supabase Client for Browser (Client Components)
 *
 * Type-safe via the generated Database type (see types/database.ts).
 * Once `types/database.ts` is generated from your Supabase schema,
 * uncomment the Database import and the <Database> type argument below.
 */
import { createBrowserClient } from '@supabase/ssr';
import { validateEnv } from '@/lib/env';

validateEnv();

export function createClient() {
  return createBrowserClient(
    // import { Database } from '@/types/database';
    // createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

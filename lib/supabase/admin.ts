import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Service-role Supabase client — NEVER import from client components.
 * Justification: bypasses RLS for admin operations and price cache writes only.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase service role environment variables');
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

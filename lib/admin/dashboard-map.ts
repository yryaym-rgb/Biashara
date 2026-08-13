import 'server-only';

import { createClient } from '@/lib/supabase/server';

/** Cooperative site counts keyed by province — real Supabase query results only. */
export async function getCooperativeCountsByProvince(): Promise<Record<string, number>> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('cooperative_sites').select('province');

  if (error) {
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const province = row.province;
    counts[province] = (counts[province] ?? 0) + 1;
  }

  return counts;
}

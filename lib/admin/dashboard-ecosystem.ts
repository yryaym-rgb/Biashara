import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

type EcosystemRole = Extract<
  Database['public']['Enums']['user_role'],
  'cooperative' | 'seller' | 'buyer' | 'institution'
>;

export type EcosystemRoleKey = EcosystemRole;

export interface EcosystemCounts {
  cooperative: number;
  seller: number;
  buyer: number;
  institution: number;
}

const ECOSYSTEM_ROLES: EcosystemRole[] = ['cooperative', 'seller', 'buyer', 'institution'];

export async function getEcosystemCounts(): Promise<EcosystemCounts> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .in('role', ECOSYSTEM_ROLES);

  if (error) {
    throw new Error(error.message);
  }

  const counts: EcosystemCounts = {
    cooperative: 0,
    seller: 0,
    buyer: 0,
    institution: 0,
  };

  for (const row of data ?? []) {
    const role = row.role as EcosystemRole;
    counts[role] += 1;
  }

  return counts;
}

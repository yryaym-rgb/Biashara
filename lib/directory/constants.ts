import type { Database } from '@/types/database.types';

export const DIRECTORY_PAGE_SIZE = 10;

export const DIRECTORY_PUBLIC_ROLES = [
  'seller',
  'cooperative',
  'buyer',
  'institution',
] as const satisfies ReadonlyArray<Database['public']['Enums']['user_role']>;

export type DirectoryPublicRole = (typeof DIRECTORY_PUBLIC_ROLES)[number];

/** Columns safe to expose on public directory pages — never include phone or email. */
export const DIRECTORY_PUBLIC_PROFILE_COLUMNS =
  'id, role, company_name, country, kyc_status, created_at' as const;

export type DirectoryPublicProfile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'role' | 'company_name' | 'country' | 'kyc_status' | 'created_at'
>;

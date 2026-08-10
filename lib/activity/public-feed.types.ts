import type { Database } from '@/types/database.types';

export type PublicActivityKind =
  | 'listing_published'
  | 'rfp_posted'
  | 'order_completed'
  | 'account_verified';

export type PublicActivityRole = Exclude<
  Database['public']['Enums']['user_role'],
  'admin'
>;

export type PublicActivityMineral = Database['public']['Enums']['mineral_type'];

export interface PublicActivityFeedEntry {
  id: string;
  kind: PublicActivityKind;
  timestamp: string;
  mineral?: PublicActivityMineral;
  province?: string;
  role?: PublicActivityRole;
}

export interface PublicActivityFeedResponse {
  events: PublicActivityFeedEntry[];
  isEmpty: boolean;
}

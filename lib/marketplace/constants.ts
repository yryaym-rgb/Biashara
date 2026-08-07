import type { Database } from '@/types/database.types';

/** Status assigned when a seller submits a new listing for moderation. */
export const LISTING_CREATE_STATUS: Database['public']['Enums']['listing_status'] =
  'pending_review';

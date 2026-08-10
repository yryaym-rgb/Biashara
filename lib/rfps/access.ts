import type { Database } from '@/types/database.types';

type RfpStatus = Database['public']['Enums']['rfp_status'];
type UserRole = Database['public']['Enums']['user_role'];

export interface RfpBidVisibilityContext {
  bidId: string;
  rfpId: string;
  sellerId: string;
  buyerId: string;
  viewerId: string | null;
  isAdmin: boolean;
}

export interface RfpSelectWinnerContext {
  rfpId: string;
  buyerId: string;
  rfpStatus: RfpStatus;
  actorId: string;
  actorRole: UserRole;
}

/**
 * Mirrors rfp_bids_select RLS: bids are visible only to the RFP buyer,
 * the bidding seller themselves, and admins.
 */
export function canViewRfpBid(context: RfpBidVisibilityContext): boolean {
  if (!context.viewerId) {
    return false;
  }

  if (context.isAdmin) {
    return true;
  }

  if (context.viewerId === context.sellerId) {
    return true;
  }

  if (context.viewerId === context.buyerId) {
    return true;
  }

  return false;
}

/**
 * Another seller on the same RFP must never see competing bids.
 */
export function isCompetingSellerBlocked(context: RfpBidVisibilityContext): boolean {
  if (!context.viewerId || context.isAdmin) {
    return false;
  }

  if (context.viewerId === context.buyerId || context.viewerId === context.sellerId) {
    return false;
  }

  return true;
}

/**
 * Mirrors rfps_update_own + select-winner action authorization.
 */
export function canSelectRfpWinner(context: RfpSelectWinnerContext): boolean {
  if (context.actorRole === 'admin') {
    return true;
  }

  if (context.actorId !== context.buyerId) {
    return false;
  }

  return context.rfpStatus === 'open';
}

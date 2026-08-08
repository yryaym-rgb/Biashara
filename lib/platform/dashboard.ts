import type { Database } from '@/types/database.types';
import { isSellerRole } from '@/lib/rbac';

type KycStatus = Database['public']['Enums']['kyc_status'];

export type KycBannerTone = 'info' | 'warning' | 'neutral';

export type DashboardPersona = 'seller' | 'buyer';

export type SellerStatKey =
  | 'activeListings'
  | 'pendingOffersReceived'
  | 'ordersInProgress'
  | 'monthlyRevenue';

export type BuyerStatKey =
  | 'pendingOffersSent'
  | 'ordersInProgress'
  | 'recentlyViewedListings';

export type DashboardStatKey = SellerStatKey | BuyerStatKey;

export function shouldShowKycBanner(kycStatus: KycStatus): boolean {
  return kycStatus !== 'approved';
}

export function getKycBannerTone(kycStatus: KycStatus): KycBannerTone {
  switch (kycStatus) {
    case 'pending':
      return 'info';
    case 'rejected':
      return 'warning';
    default:
      return 'neutral';
  }
}

export function getDashboardPersona(role: string): DashboardPersona {
  return isSellerRole(role) ? 'seller' : 'buyer';
}

export function getDashboardStatKeys(role: string): DashboardStatKey[] {
  if (isSellerRole(role)) {
    return [
      'activeListings',
      'pendingOffersReceived',
      'ordersInProgress',
      'monthlyRevenue',
    ];
  }

  return ['pendingOffersSent', 'ordersInProgress', 'recentlyViewedListings'];
}

export interface DashboardActivityCounts {
  listings: number;
  offers: number;
  orders: number;
  conversations: number;
}

export function isNewDashboardAccount(counts: DashboardActivityCounts): boolean {
  return (
    counts.listings === 0 &&
    counts.offers === 0 &&
    counts.orders === 0 &&
    counts.conversations === 0
  );
}

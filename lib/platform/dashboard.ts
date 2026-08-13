import type { Database } from '@/types/database.types';
import { isCooperativeRole, isSellerRole } from '@/lib/rbac';

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
  | 'activePurchaseRequests'
  | 'ordersInProgress';

export type CooperativeStatKey =
  | 'lots'
  | 'offers'
  | 'openPurchaseRequests'
  | 'ordersInProgress';

export type DashboardStatKey = SellerStatKey | BuyerStatKey | CooperativeStatKey;

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

export function getCooperativeStatKeys(): CooperativeStatKey[] {
  return ['lots', 'offers', 'openPurchaseRequests', 'ordersInProgress'];
}

export function getDashboardStatKeys(role: string): DashboardStatKey[] {
  if (isCooperativeRole(role)) {
    return getCooperativeStatKeys();
  }

  if (isSellerRole(role)) {
    return [
      'activeListings',
      'pendingOffersReceived',
      'ordersInProgress',
      'monthlyRevenue',
    ];
  }

  return ['pendingOffersSent', 'activePurchaseRequests', 'ordersInProgress'];
}

export function isBuyerDashboardRole(role: string): boolean {
  return role === 'buyer' || role === 'institution';
}

export const COOPERATIVE_KPI_HREFS: Record<
  CooperativeStatKey,
  '/lots' | '/offers' | '/rfps' | '/orders'
> = {
  lots: '/lots',
  offers: '/offers',
  openPurchaseRequests: '/rfps',
  ordersInProgress: '/orders',
};

export const SELLER_KPI_HREFS: Record<
  SellerStatKey,
  '/settings?tab=listings' | '/offers' | '/orders'
> = {
  activeListings: '/settings?tab=listings',
  pendingOffersReceived: '/offers',
  ordersInProgress: '/orders',
  monthlyRevenue: '/orders',
};

export const BUYER_KPI_HREFS: Record<BuyerStatKey, '/offers' | '/rfps' | '/orders'> = {
  pendingOffersSent: '/offers',
  activePurchaseRequests: '/rfps',
  ordersInProgress: '/orders',
};

export function getDashboardKpiHref(
  role: string,
  key: DashboardStatKey,
): string | undefined {
  if (isCooperativeRole(role)) {
    return COOPERATIVE_KPI_HREFS[key as CooperativeStatKey];
  }

  if (isSellerRole(role)) {
    return SELLER_KPI_HREFS[key as SellerStatKey];
  }

  if (isBuyerDashboardRole(role)) {
    return BUYER_KPI_HREFS[key as BuyerStatKey];
  }

  return undefined;
}

export type DashboardQuickActionKey =
  | 'publish-lot'
  | 'publish-listing'
  | 'explore'
  | 'publish-rfp';

export function getDashboardPrimaryQuickActionKeys(role: string): DashboardQuickActionKey[] {
  if (isCooperativeRole(role)) {
    return ['publish-lot', 'explore'];
  }

  if (isSellerRole(role)) {
    return ['publish-listing', 'explore'];
  }

  return ['explore', 'publish-rfp'];
}

export interface DashboardActivityCounts {
  listings: number;
  offers: number;
  orders: number;
  conversations: number;
}

/** True when the account has no platform activity — controls onboarding banner only. */
export function isNewDashboardAccount(counts: DashboardActivityCounts): boolean {
  return (
    counts.listings === 0 &&
    counts.offers === 0 &&
    counts.orders === 0 &&
    counts.conversations === 0
  );
}

/** KPI cards and market widgets are always rendered regardless of account age. */
export function shouldAlwaysShowDashboardKpis(): boolean {
  return true;
}

/** @deprecated Use isNewDashboardAccount — kept for tests documenting the onboarding-banner gate. */
export function shouldShowOnboardingBanner(counts: DashboardActivityCounts): boolean {
  return isNewDashboardAccount(counts);
}

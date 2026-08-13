import type { Database } from '@/types/database.types';

export type ActionCenterItemType =
  | 'pending_offer'
  | 'disputed_order'
  | 'rejected_kyc'
  | 'rejected_listing';

export interface ActionCenterItem {
  id: string;
  type: ActionCenterItemType;
  title: string;
  subtitle: string;
  href: string;
  priority: number;
}

type KycDocumentType = Database['public']['Enums']['kyc_document_type'];

const ACTION_PRIORITY: Record<ActionCenterItemType, number> = {
  disputed_order: 1,
  pending_offer: 2,
  rejected_kyc: 3,
  rejected_listing: 4,
};

export function buildActionCenterItems(input: {
  pendingOffers: Array<{
    offerId: string;
    listingTitle: string;
    counterpartName: string;
  }>;
  disputedOrders: Array<{
    orderId: string;
    listingTitle: string;
    counterpartName: string;
  }>;
  rejectedKycDocuments: KycDocumentType[];
  rejectedListings: Array<{
    listingId: string;
    title: string;
  }>;
}): ActionCenterItem[] {
  const items: ActionCenterItem[] = [];

  for (const order of input.disputedOrders) {
    items.push({
      id: `disputed-${order.orderId}`,
      type: 'disputed_order',
      title: order.listingTitle,
      subtitle: order.counterpartName,
      href: `/orders/${order.orderId}`,
      priority: ACTION_PRIORITY.disputed_order,
    });
  }

  for (const offer of input.pendingOffers) {
    items.push({
      id: `offer-${offer.offerId}`,
      type: 'pending_offer',
      title: offer.listingTitle,
      subtitle: offer.counterpartName,
      href: '/offers?tab=received',
      priority: ACTION_PRIORITY.pending_offer,
    });
  }

  for (const docType of input.rejectedKycDocuments) {
    items.push({
      id: `kyc-${docType}`,
      type: 'rejected_kyc',
      title: docType,
      subtitle: '',
      href: '/settings?tab=kyc',
      priority: ACTION_PRIORITY.rejected_kyc,
    });
  }

  for (const listing of input.rejectedListings) {
    items.push({
      id: `listing-${listing.listingId}`,
      type: 'rejected_listing',
      title: listing.title,
      subtitle: '',
      href: '/settings',
      priority: ACTION_PRIORITY.rejected_listing,
    });
  }

  return items.sort((a, b) => a.priority - b.priority);
}

export interface ActionCenterSummary {
  pendingOffersCount: number;
  disputedOrdersCount: number;
  rejectedKycCount: number;
  rejectedListingsCount: number;
}

export function summarizeActionCenterItems(items: ActionCenterItem[]): ActionCenterSummary {
  return {
    pendingOffersCount: items.filter((item) => item.type === 'pending_offer').length,
    disputedOrdersCount: items.filter((item) => item.type === 'disputed_order').length,
    rejectedKycCount: items.filter((item) => item.type === 'rejected_kyc').length,
    rejectedListingsCount: items.filter((item) => item.type === 'rejected_listing').length,
  };
}

export function hasActionCenterAlerts(summary: ActionCenterSummary): boolean {
  return (
    summary.pendingOffersCount > 0 ||
    summary.disputedOrdersCount > 0 ||
    summary.rejectedKycCount > 0 ||
    summary.rejectedListingsCount > 0
  );
}

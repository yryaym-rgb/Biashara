import type { Database } from '@/types/database.types';

type OfferStatus = Database['public']['Enums']['offer_status'];

export interface OfferListingInfo {
  id: string;
  title: string;
  mineral: Database['public']['Enums']['mineral_type'];
  unit: Database['public']['Enums']['quantity_unit'];
  price_currency: string;
  seller_id: string;
  listing_photos: Array<{ storage_path: string | null; sort_order: number }>;
}

export interface OfferProfileInfo {
  company_name: string | null;
}

export interface PlatformOfferRow {
  id: string;
  listing_id: string;
  buyer_id: string;
  offered_price: number;
  quantity: number;
  message: string | null;
  status: OfferStatus;
  parent_offer_id: string | null;
  created_at: string;
  listing: OfferListingInfo;
  buyer: OfferProfileInfo | null;
  seller: OfferProfileInfo | null;
  order_id: string | null;
}

export interface OfferChain {
  rootId: string;
  offers: PlatformOfferRow[];
  latest: PlatformOfferRow;
}

export function getOfferChainDepth(
  offer: Pick<PlatformOfferRow, 'id' | 'parent_offer_id'>,
  offerMap: Map<string, PlatformOfferRow>,
): number {
  let depth = 0;
  let parentId = offer.parent_offer_id;

  while (parentId) {
    depth += 1;
    parentId = offerMap.get(parentId)?.parent_offer_id ?? null;
  }

  return depth;
}

export function isSellerTurn(depth: number): boolean {
  return depth % 2 === 0;
}

export function buildOfferChains(offers: PlatformOfferRow[]): OfferChain[] {
  const offerMap = new Map(offers.map((offer) => [offer.id, offer]));

  const rootFor = (offer: PlatformOfferRow): string => {
    let current = offer;
    while (current.parent_offer_id && offerMap.has(current.parent_offer_id)) {
      current = offerMap.get(current.parent_offer_id)!;
    }
    return current.id;
  };

  const chains = new Map<string, PlatformOfferRow[]>();

  for (const offer of offers) {
    const rootId = rootFor(offer);
    const existing = chains.get(rootId) ?? [];
    existing.push(offer);
    chains.set(rootId, existing);
  }

  return Array.from(chains.entries())
    .map(([rootId, chainOffers]) => {
      const sorted = [...chainOffers].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
      return {
        rootId,
        offers: sorted,
        latest: sorted[sorted.length - 1]!,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.latest.created_at).getTime() - new Date(a.latest.created_at).getTime(),
    );
}

export function canRespondToOffer(
  offer: PlatformOfferRow,
  userId: string,
  depth: number,
): boolean {
  if (offer.status !== 'pending') {
    return false;
  }

  const sellerId = offer.listing.seller_id;
  const isSeller = sellerId === userId;
  const isBuyer = offer.buyer_id === userId;
  const sellerTurn = isSellerTurn(depth);

  return sellerTurn ? isSeller : isBuyer;
}

export function isWaitingOnOtherParty(
  offer: PlatformOfferRow,
  userId: string,
  depth: number,
): boolean {
  if (offer.status !== 'pending') {
    return false;
  }

  return !canRespondToOffer(offer, userId, depth);
}

import 'server-only';

import { createClient } from '@/lib/supabase/server';
import {
  buildOfferChains,
  canRespondToOffer,
  getOfferChainDepth,
  type PlatformOfferRow,
} from '@/lib/platform/offer-chain';
import { getUserKycDocuments } from '@/lib/admin/queries';
import {
  buildActionCenterItems,
  type ActionCenterItem,
} from '@/lib/platform/action-center.logic';

export type { ActionCenterItem, ActionCenterItemType } from '@/lib/platform/action-center.logic';
export { buildActionCenterItems } from '@/lib/platform/action-center.logic';

function normalizeOfferForAction(raw: Record<string, unknown>): PlatformOfferRow {
  const listing = Array.isArray(raw.listing) ? raw.listing[0] : raw.listing;
  const buyer = Array.isArray(raw.buyer) ? raw.buyer[0] : raw.buyer;
  const sellerProfile = listing?.seller
    ? Array.isArray(listing.seller)
      ? listing.seller[0]
      : listing.seller
    : null;

  return {
    id: raw.id as string,
    listing_id: raw.listing_id as string,
    buyer_id: raw.buyer_id as string,
    offered_price: Number(raw.offered_price),
    quantity: Number(raw.quantity),
    message: (raw.message as string | null) ?? null,
    status: raw.status as PlatformOfferRow['status'],
    parent_offer_id: (raw.parent_offer_id as string | null) ?? null,
    created_at: raw.created_at as string,
    buyer: buyer as PlatformOfferRow['buyer'],
    seller: sellerProfile as PlatformOfferRow['seller'],
    order_id: null,
    listing: {
      id: listing?.id as string,
      title: listing?.title as string,
      mineral: listing?.mineral,
      unit: listing?.unit,
      price_currency: listing?.price_currency ?? 'USD',
      seller_id: listing?.seller_id as string,
      listing_photos: [],
    },
  };
}

function findOffersAwaitingResponse(
  offers: PlatformOfferRow[],
  userId: string,
): Array<{ offerId: string; listingTitle: string; counterpartName: string }> {
  const chains = buildOfferChains(offers);
  const offerMap = new Map(offers.map((offer) => [offer.id, offer]));
  const results: Array<{ offerId: string; listingTitle: string; counterpartName: string }> = [];
  const seen = new Set<string>();

  for (const chain of chains) {
    const latest = chain.latest;
    if (latest.status !== 'pending') {
      continue;
    }

    const depth = getOfferChainDepth(latest, offerMap);
    if (!canRespondToOffer(latest, userId, depth)) {
      continue;
    }

    if (seen.has(latest.id)) {
      continue;
    }
    seen.add(latest.id);

    const isSeller = latest.listing.seller_id === userId;
    const counterpart = isSeller
      ? latest.buyer?.company_name?.trim() || ''
      : latest.seller?.company_name?.trim() || '';

    results.push({
      offerId: latest.id,
      listingTitle: latest.listing.title,
      counterpartName: counterpart,
    });
  }

  return results;
}

export async function getActionCenterItems(userId: string): Promise<ActionCenterItem[]> {
  const supabase = await createClient();

  const offerSelect = `
    id,
    listing_id,
    buyer_id,
    offered_price,
    quantity,
    message,
    status,
    parent_offer_id,
    created_at,
    buyer:profiles!offers_buyer_id_fkey(company_name),
    listing:listings(
      id,
      title,
      mineral,
      unit,
      price_currency,
      seller_id,
      seller:profiles!listings_seller_id_fkey(company_name)
    )
  `;

  const [buyerOffersRes, sellerOffersRes, disputedOrdersRes, rejectedListingsRes, kycDocuments] =
    await Promise.all([
      supabase.from('offers').select(offerSelect).eq('buyer_id', userId),
      supabase
        .from('offers')
        .select(offerSelect.replace('listing:listings(', 'listing:listings!inner('))
        .eq('listing.seller_id', userId),
      supabase
        .from('orders')
        .select(
          `
            id,
            buyer_id,
            seller_id,
            buyer:profiles!orders_buyer_id_fkey(company_name),
            seller:profiles!orders_seller_id_fkey(company_name),
            listing:listings(title)
          `,
        )
        .eq('status', 'disputed')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`),
      supabase
        .from('listings')
        .select('id, title')
        .eq('seller_id', userId)
        .eq('status', 'rejected'),
      getUserKycDocuments(userId),
    ]);

  const errors = [
    buyerOffersRes.error,
    sellerOffersRes.error,
    disputedOrdersRes.error,
    rejectedListingsRes.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors[0]!.message);
  }

  const allOffers = [
    ...(buyerOffersRes.data ?? []),
    ...(sellerOffersRes.data ?? []),
  ].map((row) => normalizeOfferForAction(row as unknown as Record<string, unknown>));

  const uniqueOffers = Array.from(new Map(allOffers.map((o) => [o.id, o])).values());
  const pendingOffers = findOffersAwaitingResponse(uniqueOffers, userId);

  const disputedOrders = (disputedOrdersRes.data ?? []).map((row) => {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    const buyer = Array.isArray(row.buyer) ? row.buyer[0] : row.buyer;
    const seller = Array.isArray(row.seller) ? row.seller[0] : row.seller;
    const isBuyer = row.buyer_id === userId;
    const counterpart = isBuyer
      ? seller?.company_name?.trim() || ''
      : buyer?.company_name?.trim() || '';

    return {
      orderId: row.id,
      listingTitle: listing?.title ?? '',
      counterpartName: counterpart,
    };
  });

  const rejectedKycDocuments = kycDocuments
    .filter((doc) => doc.status === 'rejected')
    .map((doc) => doc.type);

  const rejectedListings = (rejectedListingsRes.data ?? []).map((row) => ({
    listingId: row.id,
    title: row.title,
  }));

  return buildActionCenterItems({
    pendingOffers,
    disputedOrders,
    rejectedKycDocuments,
    rejectedListings,
  });
}

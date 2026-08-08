import 'server-only';

import { createClient } from '@/lib/supabase/server';
import {
  buildOfferChains,
  type OfferChain,
  type PlatformOfferRow,
} from '@/lib/platform/offer-chain';

const OFFER_SELECT = `
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
    seller:profiles!listings_seller_id_fkey(company_name),
    listing_photos(storage_path, sort_order)
  ),
  orders(id)
`;

function normalizeOfferRow(raw: Record<string, unknown>): PlatformOfferRow {
  const listing = Array.isArray(raw.listing) ? raw.listing[0] : raw.listing;
  const buyer = Array.isArray(raw.buyer) ? raw.buyer[0] : raw.buyer;
  const orders = Array.isArray(raw.orders) ? raw.orders : raw.orders ? [raw.orders] : [];
  const sellerProfile = listing?.seller
    ? Array.isArray(listing.seller)
      ? listing.seller[0]
      : listing.seller
    : null;

  const photos = listing?.listing_photos ?? [];
  const sortedPhotos = [...photos].sort(
    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order,
  );

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
    order_id: (orders[0] as { id: string } | undefined)?.id ?? null,
    listing: {
      id: listing?.id as string,
      title: listing?.title as string,
      mineral: listing?.mineral,
      unit: listing?.unit,
      price_currency: listing?.price_currency ?? 'USD',
      seller_id: listing?.seller_id as string,
      listing_photos: sortedPhotos,
    },
  };
}

export type { OfferChain, PlatformOfferRow } from '@/lib/platform/offer-chain';

export async function getSentOfferChains(userId: string): Promise<OfferChain[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('offers')
    .select(OFFER_SELECT)
    .eq('buyer_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return buildOfferChains(
    (data ?? []).map((row) => normalizeOfferRow(row as unknown as Record<string, unknown>)),
  );
}

export async function getReceivedOfferChains(userId: string): Promise<OfferChain[]> {
  const supabase = await createClient();

  const receivedSelect = OFFER_SELECT.replace(
    'listing:listings(',
    'listing:listings!inner(',
  );

  const { data, error } = await supabase
    .from('offers')
    .select(receivedSelect)
    .eq('listing.seller_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return buildOfferChains(
    (data ?? []).map((row) => normalizeOfferRow(row as unknown as Record<string, unknown>)),
  );
}

export async function getOfferForAction(offerId: string): Promise<PlatformOfferRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('offers')
    .select(OFFER_SELECT)
    .eq('id', offerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? normalizeOfferRow(data as unknown as Record<string, unknown>) : null;
}

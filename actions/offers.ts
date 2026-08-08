'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireAuth, requireKycApproved } from '@/lib/rbac';
import {
  canRespondToOffer,
  getOfferChainDepth,
} from '@/lib/platform/offer-chain';
import { getOfferForAction } from '@/lib/platform/offers';
import {
  offerCreateSchema,
  offerCounterSchema,
  acceptOfferSchema,
} from '@/lib/validators/offer';
import { sanitizeText } from '@/lib/sanitize';
import { createNotification } from '@/lib/notifications/create';
import type { Database } from '@/types/database.types';

function revalidateOfferPaths() {
  revalidatePath('/offers');
  revalidatePath('/dashboard');
  revalidatePath('/orders');
}

export async function createOffer(input: unknown) {
  const profile = requireKycApproved(requireAuth(await getProfile()));
  const parsed = offerCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('offers')
    .insert({
      listing_id: parsed.data.listingId,
      buyer_id: profile.id,
      offered_price: parsed.data.offeredPrice,
      quantity: parsed.data.quantity,
      message: parsed.data.message ? sanitizeText(parsed.data.message, 2000) : null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  const { data: listing } = await supabase
    .from('listings')
    .select('seller_id, title')
    .eq('id', parsed.data.listingId)
    .single();

  if (listing) {
    await createNotification(listing.seller_id, 'offer', {
      action: 'received',
      offerId: data.id,
      listingTitle: listing.title,
    });
  }

  revalidateOfferPaths();
  return { data };
}

export async function counterOffer(input: unknown) {
  const profile = requireAuth(await getProfile());
  const parsed = offerCounterSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const parent = await getOfferForAction(parsed.data.parentOfferId);
  if (!parent) {
    return { error: 'parentOfferNotFound' };
  }

  if (parent.status !== 'pending') {
    return { error: 'offerNotActionable' };
  }

  const offerMap = new Map([[parent.id, parent]]);
  const depth = getOfferChainDepth(parent, offerMap);
  if (!canRespondToOffer(parent, profile.id, depth)) {
    return { error: 'forbidden' };
  }

  const supabase = await createClient();

  const { error: parentUpdateError } = await supabase
    .from('offers')
    .update({ status: 'countered' as Database['public']['Enums']['offer_status'] })
    .eq('id', parent.id);

  if (parentUpdateError) {
    return { error: parentUpdateError.message };
  }

  const { data, error } = await supabase
    .from('offers')
    .insert({
      listing_id: parent.listing_id,
      buyer_id: parent.buyer_id,
      offered_price: parsed.data.offeredPrice,
      quantity: parsed.data.quantity,
      message: parsed.data.message ? sanitizeText(parsed.data.message, 2000) : null,
      status: 'pending',
      parent_offer_id: parent.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  const sellerId = parent.listing.seller_id;
  const recipientId = profile.id === sellerId ? parent.buyer_id : sellerId;

  await createNotification(recipientId, 'offer', {
    action: 'countered',
    offerId: data.id,
    listingTitle: parent.listing.title,
  });

  revalidateOfferPaths();
  return { data };
}

export async function acceptOffer(input: unknown) {
  const profile = requireAuth(await getProfile());
  const parsed = acceptOfferSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const offer = await getOfferForAction(parsed.data.offerId);
  if (!offer) {
    return { error: 'offerNotFound' };
  }

  const offerMap = new Map([[offer.id, offer]]);
  const depth = getOfferChainDepth(offer, offerMap);
  if (!canRespondToOffer(offer, profile.id, depth)) {
    return { error: 'forbidden' };
  }

  const supabase = await createClient();
  const { data: orderId, error } = await supabase.rpc('create_order_from_offer', {
    p_offer_id: parsed.data.offerId,
  });

  if (error) {
    return { error: error.message };
  }

  await createNotification(offer.buyer_id, 'offer', {
    action: 'accepted',
    offerId: offer.id,
    listingTitle: offer.listing.title,
  });

  revalidateOfferPaths();
  return { orderId };
}

export async function declineOffer(offerId: string) {
  const profile = requireAuth(await getProfile());

  const offer = await getOfferForAction(offerId);
  if (!offer) {
    return { error: 'offerNotFound' };
  }

  const offerMap = new Map([[offer.id, offer]]);
  const depth = getOfferChainDepth(offer, offerMap);
  if (!canRespondToOffer(offer, profile.id, depth)) {
    return { error: 'forbidden' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('offers')
    .update({ status: 'declined' as Database['public']['Enums']['offer_status'] })
    .eq('id', offerId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  const sellerId = offer.listing.seller_id;
  const recipientId = profile.id === sellerId ? offer.buyer_id : sellerId;

  await createNotification(recipientId, 'offer', {
    action: 'declined',
    offerId: offer.id,
    listingTitle: offer.listing.title,
  });

  revalidateOfferPaths();
  return { data };
}

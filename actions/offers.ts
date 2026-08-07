'use server';

import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireAuth, requireKycApproved } from '@/lib/rbac';
import {
  offerCreateSchema,
  offerCounterSchema,
  acceptOfferSchema,
} from '@/lib/validators/offer';
import { sanitizeText } from '@/lib/sanitize';
import type { Database } from '@/types/database.types';

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

  return { data };
}

export async function counterOffer(input: unknown) {
  const profile = requireAuth(await getProfile());
  const parsed = offerCounterSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data: parent, error: parentError } = await supabase
    .from('offers')
    .select('listing_id, status')
    .eq('id', parsed.data.parentOfferId)
    .single();

  if (parentError || !parent) {
    return { error: 'parentOfferNotFound' };
  }

  const { data, error } = await supabase
    .from('offers')
    .insert({
      listing_id: parent.listing_id,
      buyer_id: profile.id,
      offered_price: parsed.data.offeredPrice,
      quantity: parsed.data.quantity,
      message: parsed.data.message ? sanitizeText(parsed.data.message, 2000) : null,
      status: 'countered',
      parent_offer_id: parsed.data.parentOfferId,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function acceptOffer(input: unknown) {
  requireAuth(await getProfile());
  const parsed = acceptOfferSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data: orderId, error } = await supabase.rpc('create_order_from_offer', {
    p_offer_id: parsed.data.offerId,
  });

  if (error) {
    return { error: error.message };
  }

  return { orderId };
}

export async function declineOffer(offerId: string) {
  requireAuth(await getProfile());
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

  return { data };
}

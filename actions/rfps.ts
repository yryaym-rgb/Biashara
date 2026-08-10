'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireAuth, requireKycApproved, isSellerRole } from '@/lib/rbac';
import { canSelectRfpWinner } from '@/lib/rfps/access';
import {
  rfpBidCreateSchema,
  rfpCreateSchema,
  rfpSelectBidSchema,
} from '@/lib/validators/rfp';
import { sanitizeText } from '@/lib/sanitize';
import { createNotification } from '@/lib/notifications/create';
import type { Database } from '@/types/database.types';

function revalidateRfpPaths(rfpId?: string) {
  revalidatePath('/rfps');
  revalidatePath('/dashboard');
  if (rfpId) {
    revalidatePath(`/rfps/${rfpId}`);
  }
}

export async function createRfp(input: unknown) {
  const profile = requireKycApproved(requireAuth(await getProfile()));
  if (profile.role !== 'buyer' && profile.role !== 'institution') {
    return { error: 'forbidden' };
  }

  const parsed = rfpCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rfps')
    .insert({
      buyer_id: profile.id,
      mineral: parsed.data.mineral as Database['public']['Enums']['mineral_type'],
      quantity: parsed.data.quantity,
      unit: parsed.data.unit as Database['public']['Enums']['quantity_unit'],
      target_price_min: parsed.data.targetPriceMin ?? null,
      target_price_max: parsed.data.targetPriceMax ?? null,
      delivery_terms: parsed.data.deliveryTerms
        ? sanitizeText(parsed.data.deliveryTerms, 2000)
        : null,
      deadline: parsed.data.deadline,
      description: sanitizeText(parsed.data.description, 5000),
      status: 'open',
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateRfpPaths(data.id);
  return { data };
}

export async function submitRfpBid(input: unknown) {
  const profile = requireKycApproved(requireAuth(await getProfile()));
  if (!isSellerRole(profile.role)) {
    return { error: 'forbidden' };
  }

  const parsed = rfpBidCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();

  const { data: rfp, error: rfpError } = await supabase
    .from('rfps')
    .select('id, buyer_id, status, mineral')
    .eq('id', parsed.data.rfpId)
    .maybeSingle();

  if (rfpError) {
    return { error: rfpError.message };
  }

  if (!rfp || rfp.status !== 'open') {
    return { error: 'rfpNotOpen' };
  }

  if (rfp.buyer_id === profile.id) {
    return { error: 'forbidden' };
  }

  const { data, error } = await supabase
    .from('rfp_bids')
    .insert({
      rfp_id: parsed.data.rfpId,
      seller_id: profile.id,
      offered_price: parsed.data.offeredPrice,
      quantity: parsed.data.quantity,
      delivery_terms: parsed.data.deliveryTerms
        ? sanitizeText(parsed.data.deliveryTerms, 2000)
        : null,
      message: parsed.data.message ? sanitizeText(parsed.data.message, 2000) : null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  await createNotification(rfp.buyer_id, 'rfp', {
    action: 'bid_received',
    rfpId: rfp.id,
    mineral: rfp.mineral,
    bidId: data.id,
  });

  revalidateRfpPaths(rfp.id);
  return { data };
}

export async function selectRfpBid(input: unknown) {
  const profile = requireAuth(await getProfile());
  const parsed = rfpSelectBidSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();

  const { data: rfp, error: rfpError } = await supabase
    .from('rfps')
    .select('id, buyer_id, status, mineral')
    .eq('id', parsed.data.rfpId)
    .maybeSingle();

  if (rfpError) {
    return { error: rfpError.message };
  }

  if (!rfp) {
    return { error: 'rfpNotFound' };
  }

  if (
    !canSelectRfpWinner({
      rfpId: rfp.id,
      buyerId: rfp.buyer_id,
      rfpStatus: rfp.status,
      actorId: profile.id,
      actorRole: profile.role,
    })
  ) {
    return { error: 'forbidden' };
  }

  const { data: selectedBid, error: bidError } = await supabase
    .from('rfp_bids')
    .select('id, seller_id, status')
    .eq('id', parsed.data.bidId)
    .eq('rfp_id', parsed.data.rfpId)
    .maybeSingle();

  if (bidError) {
    return { error: bidError.message };
  }

  if (!selectedBid || selectedBid.status !== 'pending') {
    return { error: 'bidNotFound' };
  }

  const { data: allBids, error: allBidsError } = await supabase
    .from('rfp_bids')
    .select('id, seller_id, status')
    .eq('rfp_id', parsed.data.rfpId);

  if (allBidsError) {
    return { error: allBidsError.message };
  }

  const { error: rfpUpdateError } = await supabase
    .from('rfps')
    .update({ status: 'awarded' as Database['public']['Enums']['rfp_status'] })
    .eq('id', parsed.data.rfpId);

  if (rfpUpdateError) {
    return { error: rfpUpdateError.message };
  }

  for (const bid of allBids ?? []) {
    const nextStatus: Database['public']['Enums']['rfp_bid_status'] =
      bid.id === selectedBid.id ? 'selected' : 'rejected';

    const { error: bidUpdateError } = await supabase
      .from('rfp_bids')
      .update({ status: nextStatus })
      .eq('id', bid.id);

    if (bidUpdateError) {
      return { error: bidUpdateError.message };
    }

    await createNotification(bid.seller_id, 'rfp', {
      action: bid.id === selectedBid.id ? 'bid_selected' : 'bid_rejected',
      rfpId: rfp.id,
      mineral: rfp.mineral,
      bidId: bid.id,
    });
  }

  const { data: existingConversation, error: existingError } = await supabase
    .from('conversations')
    .select('id')
    .eq('rfp_id', rfp.id)
    .eq('seller_id', selectedBid.seller_id)
    .maybeSingle();

  if (existingError) {
    return { error: existingError.message };
  }

  let conversationId = existingConversation?.id;

  if (!conversationId) {
    const { data: createdConversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        rfp_id: rfp.id,
        buyer_id: rfp.buyer_id,
        seller_id: selectedBid.seller_id,
        listing_id: null,
      })
      .select('id')
      .single();

    if (conversationError) {
      return { error: conversationError.message };
    }

    conversationId = createdConversation.id;
  }

  revalidateRfpPaths(rfp.id);
  revalidatePath('/messages');

  return { conversationId };
}

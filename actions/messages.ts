'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireAuth, requireKycApproved, isSellerRole } from '@/lib/rbac';
import {
  messageCreateSchema,
  conversationCreateSchema,
  profileConversationCreateSchema,
  markConversationReadSchema,
} from '@/lib/validators/message';
import { sanitizeText } from '@/lib/sanitize';
import { findDirectoryContactContext } from '@/lib/directory/queries';
import { isDirectoryEligibleProfile } from '@/lib/directory/filters';
import { createAdminClient } from '@/lib/supabase/admin';

async function assertConversationParticipant(conversationId: string, userId: string) {
  const supabase = await createClient();
  const { data: conversation } = await supabase
    .from('conversations')
    .select('buyer_id, seller_id')
    .eq('id', conversationId)
    .maybeSingle();

  if (
    !conversation ||
    (conversation.buyer_id !== userId && conversation.seller_id !== userId)
  ) {
    return false;
  }

  return true;
}

export async function createConversation(input: unknown) {
  const profile = requireKycApproved(await getProfile());
  const parsed = conversationCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from('listings')
    .select('seller_id')
    .eq('id', parsed.data.listingId)
    .single();

  if (!listing) {
    return { error: 'listingNotFound' };
  }

  if (listing.seller_id === profile.id) {
    return { error: 'forbidden' };
  }

  const { data, error } = await supabase
    .from('conversations')
    .upsert(
      {
        listing_id: parsed.data.listingId,
        buyer_id: profile.id,
        seller_id: listing.seller_id,
      },
      { onConflict: 'listing_id,buyer_id' },
    )
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function createProfileConversation(input: unknown) {
  const profile = requireKycApproved(await getProfile());
  const parsed = profileConversationCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  if (parsed.data.targetUserId === profile.id) {
    return { error: 'forbidden' };
  }

  const admin = createAdminClient();
  const { data: targetProfile, error: targetError } = await admin
    .from('profiles')
    .select('id, role, kyc_status')
    .eq('id', parsed.data.targetUserId)
    .maybeSingle();

  if (targetError) {
    return { error: targetError.message };
  }

  if (!targetProfile || !isDirectoryEligibleProfile(targetProfile)) {
    return { error: 'profileNotFound' };
  }

  const contactContext = await findDirectoryContactContext(
    targetProfile.id,
    targetProfile.role,
  );

  if (!contactContext) {
    return { error: 'contactUnavailable' };
  }

  if (contactContext.type === 'listing') {
    return createConversation({ listingId: contactContext.listingId });
  }

  if (!isSellerRole(profile.role)) {
    return { error: 'forbidden' };
  }

  const supabase = await createClient();
  const { data: rfp, error: rfpError } = await supabase
    .from('rfps')
    .select('id, buyer_id, status')
    .eq('id', contactContext.rfpId)
    .maybeSingle();

  if (rfpError) {
    return { error: rfpError.message };
  }

  if (!rfp || rfp.status !== 'open' || rfp.buyer_id !== targetProfile.id) {
    return { error: 'contactUnavailable' };
  }

  const { data, error } = await supabase
    .from('conversations')
    .upsert(
      {
        rfp_id: rfp.id,
        buyer_id: rfp.buyer_id,
        seller_id: profile.id,
        listing_id: null,
      },
      { onConflict: 'rfp_id,seller_id' },
    )
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function sendMessage(input: unknown) {
  const profile = requireAuth(await getProfile());
  const parsed = messageCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const isParticipant = await assertConversationParticipant(
    parsed.data.conversationId,
    profile.id,
  );
  if (!isParticipant) {
    return { error: 'forbidden' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: parsed.data.conversationId,
      sender_id: profile.id,
      body: sanitizeText(parsed.data.body, 5000),
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/messages');

  return { data };
}

export async function markConversationAsRead(input: unknown) {
  const profile = requireAuth(await getProfile());
  const parsed = markConversationReadSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const isParticipant = await assertConversationParticipant(
    parsed.data.conversationId,
    profile.id,
  );
  if (!isParticipant) {
    return { error: 'forbidden' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', parsed.data.conversationId)
    .neq('sender_id', profile.id)
    .is('read_at', null);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/messages');
  revalidatePath('/', 'layout');

  return { success: true };
}

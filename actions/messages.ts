'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireAuth } from '@/lib/rbac';
import {
  messageCreateSchema,
  conversationCreateSchema,
  markConversationReadSchema,
} from '@/lib/validators/message';
import { sanitizeText } from '@/lib/sanitize';

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
  const profile = requireAuth(await getProfile());
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

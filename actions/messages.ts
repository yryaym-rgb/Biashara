'use server';

import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireAuth } from '@/lib/rbac';
import { messageCreateSchema, conversationCreateSchema } from '@/lib/validators/message';
import { sanitizeText } from '@/lib/sanitize';

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
    .upsert({
      listing_id: parsed.data.listingId,
      buyer_id: profile.id,
      seller_id: listing.seller_id,
    })
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

  return { data };
}

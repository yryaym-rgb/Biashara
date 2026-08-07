'use server';

import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireAuth } from '@/lib/rbac';
import { contractSignSchema, contractUploadSchema } from '@/lib/validators/contract';
import type { Database } from '@/types/database.types';

export async function uploadContract(input: unknown) {
  requireAuth(await getProfile());
  const parsed = contractUploadSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('contracts')
    .upsert({
      order_id: parsed.data.orderId,
      storage_path: parsed.data.storagePath,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function signContract(input: unknown) {
  const profile = requireAuth(await getProfile());
  const parsed = contractSignSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select('buyer_id, seller_id')
    .eq('id', parsed.data.orderId)
    .single();

  if (!order) {
    return { error: 'orderNotFound' };
  }

  const isParty =
    (parsed.data.party === 'buyer' && order.buyer_id === profile.id) ||
    (parsed.data.party === 'seller' && order.seller_id === profile.id);

  if (!isParty) {
    return { error: 'forbidden' };
  }

  const updatePayload: Database['public']['Tables']['contracts']['Update'] =
    parsed.data.party === 'buyer'
      ? { buyer_signed: true, buyer_signed_at: new Date().toISOString() }
      : { seller_signed: true, seller_signed_at: new Date().toISOString() };

  const { data, error } = await supabase
    .from('contracts')
    .update(updatePayload)
    .eq('order_id', parsed.data.orderId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireAuth } from '@/lib/rbac';
import { orderStatusUpdateSchema } from '@/lib/validators/order';
import type { Database } from '@/types/database.types';

export async function updateOrderStatus(input: unknown) {
  requireAuth(await getProfile());
  const parsed = orderStatusUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.orderId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function getOrderById(orderId: string) {
  requireAuth(await getProfile());
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireAuth } from '@/lib/rbac';
import { getOrderForAction } from '@/lib/platform/orders';
import {
  canSellerProgressStatus,
  getNextOrderStatus,
  isDisputableOrderStatus,
} from '@/lib/platform/order-status';
import { orderDisputeSchema, orderProgressSchema } from '@/lib/validators/order';
import { sanitizeText } from '@/lib/sanitize';
import type { Database } from '@/types/database.types';

function revalidateOrderPaths(orderId: string) {
  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/dashboard');
}

export async function progressOrderStatus(input: unknown) {
  const profile = requireAuth(await getProfile());
  const parsed = orderProgressSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const order = await getOrderForAction(parsed.data.orderId);
  if (!order) {
    return { error: 'notFound' };
  }

  if (order.seller_id !== profile.id && profile.role !== 'admin') {
    return { error: 'forbidden' };
  }

  const currentStatus = order.status as Database['public']['Enums']['order_status'];
  const nextStatus = getNextOrderStatus(currentStatus);
  if (!nextStatus || !canSellerProgressStatus(currentStatus, nextStatus)) {
    return { error: 'invalidTransition' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status: nextStatus })
    .eq('id', parsed.data.orderId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateOrderPaths(parsed.data.orderId);
  return { data };
}

export async function disputeOrder(input: unknown) {
  const profile = requireAuth(await getProfile());
  const parsed = orderDisputeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const order = await getOrderForAction(parsed.data.orderId);
  if (!order) {
    return { error: 'notFound' };
  }

  if (order.buyer_id !== profile.id && profile.role !== 'admin') {
    return { error: 'forbidden' };
  }

  const currentStatus = order.status as Database['public']['Enums']['order_status'];
  if (!isDisputableOrderStatus(currentStatus)) {
    return { error: 'invalidTransition' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'disputed',
      dispute_reason: sanitizeText(parsed.data.reason, 2000),
      disputed_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.orderId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateOrderPaths(parsed.data.orderId);
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

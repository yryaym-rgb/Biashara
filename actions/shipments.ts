'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireAuth } from '@/lib/rbac';
import { getOrderForAction } from '@/lib/platform/orders';
import { canSellerProgressShipmentStatus } from '@/lib/platform/shipment-status';
import {
  shipmentCreateSchema,
  shipmentManualCheckpointSchema,
  shipmentProgressSchema,
  shipmentUpdateDetailsSchema,
} from '@/lib/validators/shipment';
import type { Database, Json } from '@/types/database.types';

function revalidateOrderPaths(orderId: string) {
  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/logistics');
}

async function getShipmentForSellerAction(shipmentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('shipments')
    .select('id, order_id, status, checkpoints, carrier, tracking_ref')
    .eq('id', shipmentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function assertSellerForOrder(orderId: string, profileId: string, role: string) {
  const order = await getOrderForAction(orderId);
  if (!order) {
    return { error: 'orderNotFound' as const };
  }

  if (order.seller_id !== profileId && role !== 'admin') {
    return { error: 'forbidden' as const };
  }

  return { order };
}

export async function createShipment(input: unknown) {
  const profile = requireAuth(await getProfile());
  const parsed = shipmentCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const access = await assertSellerForOrder(parsed.data.orderId, profile.id, profile.role);
  if ('error' in access) {
    return access;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('shipments')
    .insert({
      order_id: parsed.data.orderId,
      carrier: parsed.data.carrier,
      tracking_ref: parsed.data.trackingRef ?? null,
      status: 'pending',
      checkpoints: [] as Json,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateOrderPaths(parsed.data.orderId);
  return { data };
}

export async function updateShipmentDetails(input: unknown) {
  const profile = requireAuth(await getProfile());
  const parsed = shipmentUpdateDetailsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const shipment = await getShipmentForSellerAction(parsed.data.shipmentId);
  if (!shipment) {
    return { error: 'shipmentNotFound' };
  }

  const access = await assertSellerForOrder(shipment.order_id, profile.id, profile.role);
  if ('error' in access) {
    return access;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('shipments')
    .update({
      carrier: parsed.data.carrier,
      tracking_ref: parsed.data.trackingRef ?? null,
    })
    .eq('id', parsed.data.shipmentId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateOrderPaths(shipment.order_id);
  return { data };
}

export async function progressShipmentStatus(input: unknown) {
  const profile = requireAuth(await getProfile());
  const parsed = shipmentProgressSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const shipment = await getShipmentForSellerAction(parsed.data.shipmentId);
  if (!shipment) {
    return { error: 'shipmentNotFound' };
  }

  const access = await assertSellerForOrder(shipment.order_id, profile.id, profile.role);
  if ('error' in access) {
    return access;
  }

  const currentStatus = shipment.status as Database['public']['Enums']['shipment_status'];
  if (!canSellerProgressShipmentStatus(currentStatus, parsed.data.status)) {
    return { error: 'invalidTransition' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('shipments')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.shipmentId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateOrderPaths(shipment.order_id);
  return { data };
}

export async function addShipmentCheckpoint(input: unknown) {
  const profile = requireAuth(await getProfile());
  const parsed = shipmentManualCheckpointSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const shipment = await getShipmentForSellerAction(parsed.data.shipmentId);
  if (!shipment) {
    return { error: 'shipmentNotFound' };
  }

  const access = await assertSellerForOrder(shipment.order_id, profile.id, profile.role);
  if ('error' in access) {
    return access;
  }

  const checkpoints = Array.isArray(shipment.checkpoints) ? shipment.checkpoints : [];
  const newCheckpoint = {
    note: parsed.data.note,
    location: parsed.data.location ?? null,
    occurred_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('shipments')
    .update({
      checkpoints: [...checkpoints, newCheckpoint] as Json,
    })
    .eq('id', parsed.data.shipmentId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateOrderPaths(shipment.order_id);
  return { data };
}

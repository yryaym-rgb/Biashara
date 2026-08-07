'use server';

import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireAuth } from '@/lib/rbac';
import { shipmentCreateSchema, shipmentCheckpointSchema } from '@/lib/validators/shipment';
import type { Json } from '@/types/database.types';

export async function createShipment(input: unknown) {
  requireAuth(await getProfile());
  const parsed = shipmentCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
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

  return { data };
}

export async function addShipmentCheckpoint(input: unknown) {
  requireAuth(await getProfile());
  const parsed = shipmentCheckpointSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data: shipment, error: fetchError } = await supabase
    .from('shipments')
    .select('checkpoints')
    .eq('id', parsed.data.shipmentId)
    .single();

  if (fetchError || !shipment) {
    return { error: 'shipmentNotFound' };
  }

  const checkpoints = Array.isArray(shipment.checkpoints) ? shipment.checkpoints : [];
  const newCheckpoint = {
    status: parsed.data.status,
    location: parsed.data.location ?? null,
    notes: parsed.data.notes ?? null,
    occurred_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('shipments')
    .update({
      status: parsed.data.status,
      checkpoints: [...checkpoints, newCheckpoint] as Json,
    })
    .eq('id', parsed.data.shipmentId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

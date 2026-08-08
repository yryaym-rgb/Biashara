import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

export type ShipmentStatus = Database['public']['Enums']['shipment_status'];

export interface ShipmentCheckpoint {
  note: string;
  location: string | null;
  occurred_at: string;
}

export interface PlatformOrderShipment {
  id: string;
  order_id: string;
  carrier: string | null;
  tracking_ref: string | null;
  status: ShipmentStatus;
  checkpoints: ShipmentCheckpoint[];
  created_at: string;
  updated_at: string;
}

function parseCheckpoints(value: unknown): ShipmentCheckpoint[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const record = item as Record<string, unknown>;
      const note =
        typeof record.note === 'string'
          ? record.note
          : typeof record.notes === 'string'
            ? record.notes
            : null;
      const occurredAt =
        typeof record.occurred_at === 'string'
          ? record.occurred_at
          : typeof record.occurredAt === 'string'
            ? record.occurredAt
            : null;

      if (!note || !occurredAt) {
        return null;
      }

      return {
        note,
        location: typeof record.location === 'string' ? record.location : null,
        occurred_at: occurredAt,
      } satisfies ShipmentCheckpoint;
    })
    .filter((item): item is ShipmentCheckpoint => item !== null)
    .sort(
      (a, b) =>
        new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime(),
    );
}

export async function getShipmentForOrder(
  orderId: string,
): Promise<PlatformOrderShipment | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('shipments')
    .select('id, order_id, carrier, tracking_ref, status, checkpoints, created_at, updated_at')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    order_id: data.order_id,
    carrier: data.carrier,
    tracking_ref: data.tracking_ref,
    status: data.status,
    checkpoints: parseCheckpoints(data.checkpoints),
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

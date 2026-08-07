import { z } from 'zod';
import type { Database } from '@/types/database.types';

const shipmentStatuses = [
  'pending',
  'picked_up',
  'in_transit',
  'customs',
  'delivered',
  'exception',
] as const satisfies readonly Database['public']['Enums']['shipment_status'][];

export const shipmentCreateSchema = z.object({
  orderId: z.string().uuid(),
  carrier: z.string().min(1).max(200),
  trackingRef: z.string().min(1).max(200).optional(),
});

export const shipmentCheckpointSchema = z.object({
  shipmentId: z.string().uuid(),
  status: z.enum(shipmentStatuses),
  location: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

export type ShipmentCreateInput = z.infer<typeof shipmentCreateSchema>;
export type ShipmentCheckpointInput = z.infer<typeof shipmentCheckpointSchema>;

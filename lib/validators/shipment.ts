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
  trackingRef: z.string().max(200).optional(),
});

export const shipmentUpdateDetailsSchema = z.object({
  shipmentId: z.string().uuid(),
  carrier: z.string().min(1).max(200),
  trackingRef: z.string().max(200).optional(),
});

export const shipmentProgressSchema = z.object({
  shipmentId: z.string().uuid(),
  status: z.enum(shipmentStatuses),
});

export const shipmentManualCheckpointSchema = z.object({
  shipmentId: z.string().uuid(),
  note: z.string().min(1).max(500),
  location: z.string().max(200).optional(),
});

/** @deprecated Use shipmentManualCheckpointSchema */
export const shipmentCheckpointSchema = shipmentManualCheckpointSchema;

export type ShipmentCreateInput = z.infer<typeof shipmentCreateSchema>;
export type ShipmentUpdateDetailsInput = z.infer<typeof shipmentUpdateDetailsSchema>;
export type ShipmentProgressInput = z.infer<typeof shipmentProgressSchema>;
export type ShipmentManualCheckpointInput = z.infer<typeof shipmentManualCheckpointSchema>;

import { z } from 'zod';
import type { Database } from '@/types/database.types';

const orderStatuses = [
  'confirmed',
  'processing',
  'in_transit',
  'delivered',
  'cancelled',
  'disputed',
] as const satisfies readonly Database['public']['Enums']['order_status'][];

const normalOrderStatuses = [
  'confirmed',
  'processing',
  'in_transit',
  'delivered',
] as const satisfies readonly Database['public']['Enums']['order_status'][];

export const orderStatusUpdateSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(orderStatuses),
});

export const orderProgressSchema = z.object({
  orderId: z.string().uuid(),
});

export const orderDisputeSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().trim().min(10, 'minLength').max(2000, 'maxLength'),
});

export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
export type OrderProgressInput = z.infer<typeof orderProgressSchema>;
export type OrderDisputeInput = z.infer<typeof orderDisputeSchema>;

export { normalOrderStatuses, orderStatuses };

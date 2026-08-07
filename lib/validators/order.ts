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

export const orderStatusUpdateSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(orderStatuses),
});

export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;

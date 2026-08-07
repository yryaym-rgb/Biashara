import { z } from 'zod';
import type { Database } from '@/types/database.types';

const offerStatuses = [
  'pending',
  'countered',
  'accepted',
  'declined',
  'expired',
] as const satisfies readonly Database['public']['Enums']['offer_status'][];

export const offerCreateSchema = z.object({
  listingId: z.string().uuid(),
  offeredPrice: z.number().positive(),
  quantity: z.number().positive(),
  message: z.string().max(2000).optional(),
});

export const offerCounterSchema = z.object({
  parentOfferId: z.string().uuid(),
  offeredPrice: z.number().positive(),
  quantity: z.number().positive(),
  message: z.string().max(2000).optional(),
});

export const offerStatusUpdateSchema = z.object({
  offerId: z.string().uuid(),
  status: z.enum(offerStatuses),
});

export const acceptOfferSchema = z.object({
  offerId: z.string().uuid(),
});

export type OfferCreateInput = z.infer<typeof offerCreateSchema>;
export type OfferCounterInput = z.infer<typeof offerCounterSchema>;
export type AcceptOfferInput = z.infer<typeof acceptOfferSchema>;

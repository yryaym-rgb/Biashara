import { z } from 'zod';
import { MINERAL_IDS, QUANTITY_UNITS } from '@/lib/constants/minerals';

export const rfpCreateSchema = z
  .object({
    mineral: z.enum(MINERAL_IDS as unknown as [string, ...string[]]),
    quantity: z.number().positive(),
    unit: z.enum(QUANTITY_UNITS as unknown as [string, ...string[]]),
    targetPriceMin: z.number().positive().optional(),
    targetPriceMax: z.number().positive().optional(),
    deliveryTerms: z.string().max(2000).optional(),
    deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string().min(10).max(5000),
  })
  .refine(
    (data) => {
      if (data.targetPriceMin !== undefined && data.targetPriceMax !== undefined) {
        return data.targetPriceMax >= data.targetPriceMin;
      }
      return true;
    },
    { message: 'invalidPriceRange', path: ['targetPriceMax'] },
  );

export const rfpBidCreateSchema = z.object({
  rfpId: z.string().uuid(),
  offeredPrice: z.number().positive(),
  quantity: z.number().positive(),
  deliveryTerms: z.string().max(2000).optional(),
  message: z.string().max(2000).optional(),
});

export const rfpSelectBidSchema = z.object({
  rfpId: z.string().uuid(),
  bidId: z.string().uuid(),
});

export type RfpCreateInput = z.infer<typeof rfpCreateSchema>;
export type RfpBidCreateInput = z.infer<typeof rfpBidCreateSchema>;
export type RfpSelectBidInput = z.infer<typeof rfpSelectBidSchema>;

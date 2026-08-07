import { z } from 'zod';
import { MINERAL_IDS, QUANTITY_UNITS } from '@/lib/constants/minerals';
import type { Database } from '@/types/database.types';

const listingStatuses = [
  'draft',
  'pending_review',
  'active',
  'paused',
  'sold',
  'rejected',
] as const satisfies readonly Database['public']['Enums']['listing_status'][];

const priceTypes = [
  'fixed',
  'negotiable',
  'indicative',
] as const satisfies readonly Database['public']['Enums']['price_type'][];

export const listingCreateSchema = z.object({
  mineral: z.enum(MINERAL_IDS as unknown as [string, ...string[]]),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  grade: z.string().max(100).optional(),
  purity: z.number().min(0).max(100).optional(),
  quantity: z.number().positive(),
  unit: z.enum(QUANTITY_UNITS as unknown as [string, ...string[]]),
  priceAmount: z.number().positive().optional(),
  priceCurrency: z.string().length(3).default('USD'),
  priceType: z.enum(priceTypes),
  originProvince: z.string().min(2).max(100),
  certifications: z.array(z.string().max(100)).max(20).default([]),
});

export const listingUpdateSchema = listingCreateSchema.partial().extend({
  status: z.enum(listingStatuses).optional(),
});

export const listingIdSchema = z.object({
  listingId: z.string().uuid(),
});

export type ListingCreateInput = z.infer<typeof listingCreateSchema>;
export type ListingUpdateInput = z.infer<typeof listingUpdateSchema>;

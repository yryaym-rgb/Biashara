import { z } from 'zod';

export const adminRejectionReasonSchema = z.object({
  reason: z.string().trim().min(1, 'required').max(1000),
});

export const listingRejectSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.string().trim().min(1, 'required').max(1000),
});

export const kycRejectSchema = z.object({
  documentId: z.string().uuid(),
  reason: z.string().trim().min(1, 'required').max(1000),
});

export const kycApproveSchema = z.object({
  documentId: z.string().uuid(),
});

export const listingApproveSchema = z.object({
  listingId: z.string().uuid(),
});

export const miningEventCategorySchema = z.enum([
  'auction',
  'government',
  'conference',
  'other',
]);

export const miningEventCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: miningEventCategorySchema,
  sourceUrl: z.string().url().max(2000).optional(),
});

export const miningEventUpdateSchema = miningEventCreateSchema.extend({
  eventId: z.string().uuid(),
});

export const miningEventDeleteSchema = z.object({
  eventId: z.string().uuid(),
});

export type ListingRejectInput = z.infer<typeof listingRejectSchema>;
export type KycRejectInput = z.infer<typeof kycRejectSchema>;
export type MiningEventCreateInput = z.infer<typeof miningEventCreateSchema>;
export type MiningEventUpdateInput = z.infer<typeof miningEventUpdateSchema>;

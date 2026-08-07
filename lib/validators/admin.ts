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

export type ListingRejectInput = z.infer<typeof listingRejectSchema>;
export type KycRejectInput = z.infer<typeof kycRejectSchema>;

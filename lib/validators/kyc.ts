import { z } from 'zod';
import type { Database } from '@/types/database.types';

const kycDocumentTypes = [
  'id_card',
  'business_registration',
  'mining_permit',
  'export_license',
] as const satisfies readonly Database['public']['Enums']['kyc_document_type'][];

export const kycDocumentTypeSchema = z.enum(kycDocumentTypes);

export const kycUploadSchema = z.object({
  type: kycDocumentTypeSchema,
  storagePath: z.string().min(1).max(500),
});

export const kycReviewSchema = z.object({
  documentId: z.string().uuid(),
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().max(1000).optional(),
});

export type KycDocumentType = z.infer<typeof kycDocumentTypeSchema>;
export type KycUploadInput = z.infer<typeof kycUploadSchema>;
export type KycReviewInput = z.infer<typeof kycReviewSchema>;

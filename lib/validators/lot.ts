import { z } from 'zod';
import { MINERAL_IDS } from '@/lib/constants/minerals';

export const CUSTODY_STAGE_IDS = [
  'extraction',
  'weighing',
  'sampling',
  'analysis',
  'collection_point',
] as const;

export type CustodyStageId = (typeof CUSTODY_STAGE_IDS)[number];

export const LOT_CODE_PATTERN = /^BIA-(CB|CU|AU|CT|LI|DM)-\d{4}-\d{6}$/;

export const cooperativeSiteSchema = z.object({
  siteName: z.string().trim().min(1).max(200),
  zeaReference: z.string().trim().min(1).max(100),
  province: z.string().trim().min(2).max(100),
});

export const cooperativeSitesFormSchema = z.object({
  sites: z.array(cooperativeSiteSchema).max(50),
});

export const lotCreateSchema = z.object({
  mineral: z.enum(MINERAL_IDS as unknown as [string, ...string[]]),
  initialWeightKg: z.number().positive().max(1_000_000),
  siteId: z.string().uuid(),
  extractionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(2000).optional(),
});

export const lotCustodyCheckpointSchema = z.object({
  lotId: z.string().uuid(),
  eventType: z.enum(CUSTODY_STAGE_IDS),
  note: z.string().min(1).max(500),
  occurredAt: z.string().datetime().optional(),
});

export const lotLinkListingSchema = z.object({
  lotId: z.string().uuid(),
  listingId: z.string().uuid(),
});

export type CooperativeSiteInput = z.infer<typeof cooperativeSiteSchema>;
export type CooperativeSitesFormInput = z.infer<typeof cooperativeSitesFormSchema>;
export type LotCreateInput = z.infer<typeof lotCreateSchema>;
export type LotCustodyCheckpointInput = z.infer<typeof lotCustodyCheckpointSchema>;
export type LotLinkListingInput = z.infer<typeof lotLinkListingSchema>;

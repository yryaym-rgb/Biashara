import { z } from 'zod';
import { EXPORT_READINESS_ITEM_KEYS } from '@/lib/constants/export-readiness';

export const exportReadinessItemKeySchema = z.enum(EXPORT_READINESS_ITEM_KEYS);

export const updateExportReadinessItemSchema = z.object({
  itemKey: exportReadinessItemKeySchema,
  isComplete: z.boolean().optional(),
  notes: z.string().max(2000).nullable().optional(),
  documentId: z.string().uuid().nullable().optional(),
});

export type UpdateExportReadinessItemInput = z.infer<typeof updateExportReadinessItemSchema>;

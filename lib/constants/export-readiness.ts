import type { Database } from '@/types/database.types';

export type ExportReadinessItemKey = Database['public']['Enums']['export_readiness_item_key'];

export const EXPORT_READINESS_ITEM_KEYS = [
  'ceec_certification',
  'export_permit',
  'taxes_paid',
  'customs_forms',
  'quality_certificates',
] as const satisfies readonly ExportReadinessItemKey[];

export const EXPORT_READINESS_ITEM_COUNT = EXPORT_READINESS_ITEM_KEYS.length;

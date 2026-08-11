import 'server-only';

import { createClient } from '@/lib/supabase/server';
import {
  EXPORT_READINESS_ITEM_KEYS,
  type ExportReadinessItemKey,
} from '@/lib/constants/export-readiness';
import type { Database } from '@/types/database.types';

export type ExportReadinessItemRow =
  Database['public']['Tables']['export_readiness_items']['Row'];

export interface ExportReadinessDocumentOption {
  id: string;
  type: Database['public']['Enums']['kyc_document_type'];
  createdAt: string;
}

export interface ExportReadinessItemView extends ExportReadinessItemRow {
  item_key: ExportReadinessItemKey;
}

export async function ensureExportReadinessItems(userId: string): Promise<void> {
  const supabase = await createClient();
  const rows = EXPORT_READINESS_ITEM_KEYS.map((itemKey) => ({
    user_id: userId,
    item_key: itemKey,
  }));

  const { error } = await supabase
    .from('export_readiness_items')
    .upsert(rows, { onConflict: 'user_id,item_key', ignoreDuplicates: true });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getExportReadinessItems(
  userId: string,
): Promise<ExportReadinessItemView[]> {
  await ensureExportReadinessItems(userId);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('export_readiness_items')
    .select('*')
    .eq('user_id', userId)
    .order('item_key', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ExportReadinessItemView[];
}

export async function getExportReadinessDocumentOptions(
  userId: string,
): Promise<ExportReadinessDocumentOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('kyc_documents')
    .select('id, type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((doc) => ({
    id: doc.id,
    type: doc.type,
    createdAt: doc.created_at,
  }));
}

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireAuth, isSellerRole } from '@/lib/rbac';
import { sanitizeText } from '@/lib/sanitize';
import { updateExportReadinessItemSchema } from '@/lib/validators/export-readiness';

import type { Database } from '@/types/database.types';

type ExportReadinessItemUpdate =
  Database['public']['Tables']['export_readiness_items']['Update'];

function assertSellerAccess(profile: Awaited<ReturnType<typeof getProfile>>) {
  const authed = requireAuth(profile);
  if (!isSellerRole(authed.role)) {
    throw new Error('forbidden');
  }
  return authed;
}

export async function updateExportReadinessItemAction(input: unknown) {
  let profile;
  try {
    profile = assertSellerAccess(await getProfile());
  } catch {
    return { error: 'forbidden' as const };
  }

  const parsed = updateExportReadinessItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation' as const, details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const update: ExportReadinessItemUpdate = {};

  if (parsed.data.isComplete !== undefined) {
    update.is_complete = parsed.data.isComplete;
  }

  if (parsed.data.notes !== undefined) {
    update.notes = parsed.data.notes ? sanitizeText(parsed.data.notes, 2000) : null;
  }

  if (parsed.data.documentId !== undefined) {
    if (parsed.data.documentId) {
      const { data: document, error: documentError } = await supabase
        .from('kyc_documents')
        .select('id')
        .eq('id', parsed.data.documentId)
        .eq('user_id', profile.id)
        .maybeSingle();

      if (documentError) {
        return { error: documentError.message };
      }

      if (!document) {
        return { error: 'documentNotFound' as const };
      }
    }

    update.document_id = parsed.data.documentId;
  }

  if (Object.keys(update).length === 0) {
    return { error: 'validation' as const };
  }

  const { data, error } = await supabase
    .from('export_readiness_items')
    .update(update)
    .eq('user_id', profile.id)
    .eq('item_key', parsed.data.itemKey)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings');
  return { data };
}

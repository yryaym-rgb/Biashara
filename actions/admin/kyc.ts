'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireRole } from '@/lib/rbac';
import {
  getRequiredKycDocuments,
  hasAllRequiredKycDocuments,
} from '@/lib/constants/kyc-requirements';
import { kycApproveSchema, kycRejectSchema } from '@/lib/validators/admin';
import { adminPath } from '@/lib/admin/path';
import { sendTransactionalEmail } from '@/lib/email';
import { createNotification } from '@/lib/notifications/create';
import type { Database } from '@/types/database.types';

type KycDocumentType = Database['public']['Enums']['kyc_document_type'];

export async function approveKycDocument(input: unknown) {
  const admin = requireRole(await getProfile(), ['admin']);
  const parsed = kycApproveSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data: doc, error: fetchError } = await supabase
    .from('kyc_documents')
    .select('*')
    .eq('id', parsed.data.documentId)
    .single();

  if (fetchError || !doc) {
    return { error: 'documentNotFound' };
  }

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role, locale')
    .eq('id', doc.user_id)
    .single();

  const { error } = await supabase
    .from('kyc_documents')
    .update({
      status: 'approved',
      reviewer_id: admin.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq('id', parsed.data.documentId);

  if (error) {
    return { error: error.message };
  }

  await createNotification(doc.user_id, 'kyc', {
    action: 'approved',
    documentType: doc.type as KycDocumentType,
  });

  const { data: approvedDocs } = await supabase
    .from('kyc_documents')
    .select('type')
    .eq('user_id', doc.user_id)
    .eq('status', 'approved');

  const userRole = userProfile?.role ?? 'buyer';
  const approvedTypes = (approvedDocs ?? []).map((d) => d.type as KycDocumentType);

  if (hasAllRequiredKycDocuments(userRole, approvedTypes)) {
    await supabase
      .from('profiles')
      .update({ kyc_status: 'approved' })
      .eq('id', doc.user_id);

    const userLocale = userProfile?.locale === 'en' ? 'en' : 'fr';
    await sendTransactionalEmail({
      to: doc.user_id,
      template: 'kyc_approved',
      locale: userLocale,
      data: {},
    });
  }

  revalidatePath(adminPath());
  revalidatePath(adminPath('kyc-review'));
  revalidatePath(adminPath('users', doc.user_id));

  return { success: true };
}

export async function rejectKycDocument(input: unknown) {
  const admin = requireRole(await getProfile(), ['admin']);
  const parsed = kycRejectSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data: doc, error: fetchError } = await supabase
    .from('kyc_documents')
    .select('user_id, type')
    .eq('id', parsed.data.documentId)
    .single();

  if (fetchError || !doc) {
    return { error: 'documentNotFound' };
  }

  const { error } = await supabase
    .from('kyc_documents')
    .update({
      status: 'rejected',
      reviewer_id: admin.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: parsed.data.reason,
    })
    .eq('id', parsed.data.documentId);

  if (error) {
    return { error: error.message };
  }

  await supabase
    .from('profiles')
    .update({ kyc_status: 'rejected' })
    .eq('id', doc.user_id);

  await createNotification(doc.user_id, 'kyc', {
    action: 'rejected',
    documentType: doc.type as KycDocumentType,
    reason: parsed.data.reason,
  });

  revalidatePath(adminPath());
  revalidatePath(adminPath('kyc-review'));
  revalidatePath(adminPath('users', doc.user_id));

  return { success: true };
}

/** Required document types for a role — used by admin UI. */
export async function getKycRequirementsForRole(
  role: Database['public']['Enums']['user_role'],
) {
  requireRole(await getProfile(), ['admin']);
  return getRequiredKycDocuments(role);
}

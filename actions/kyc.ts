'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getProfile } from '@/lib/auth/session';
import { requireAuth, requireRole } from '@/lib/rbac';
import { kycUploadSchema, kycReviewSchema } from '@/lib/validators/kyc';
import {
  getRequiredKycDocuments,
  hasAllRequiredKycDocuments,
} from '@/lib/constants/kyc-requirements';
import { sendTransactionalEmail } from '@/lib/email';
import type { Database } from '@/types/database.types';

type KycDocumentType = Database['public']['Enums']['kyc_document_type'];

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function uploadKycDocument(input: unknown) {
  const profile = requireAuth(await getProfile());
  const parsed = kycUploadSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('kyc_documents')
    .upsert({
      user_id: profile.id,
      type: parsed.data.type,
      storage_path: parsed.data.storagePath,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  await supabase
    .from('profiles')
    .update({ kyc_status: 'pending' })
    .eq('id', profile.id);

  return { data };
}

export async function uploadRegistrationKycDocument(formData: FormData) {
  const userId = formData.get('userId');
  const type = formData.get('type');
  const file = formData.get('file');

  if (typeof userId !== 'string' || typeof type !== 'string' || !(file instanceof File)) {
    return { error: 'validation' };
  }

  const parsed = kycUploadSchema.safeParse({ type, storagePath: 'pending' });
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return { error: 'invalidFileType' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'fileTooLarge' };
  }

  const profile = await getProfile();
  const isOwnUpload = profile?.id === userId;

  const admin = createAdminClient();

  if (!isOwnUpload) {
    const { data: authUser, error: userError } = await admin.auth.admin.getUserById(userId);
    if (userError || !authUser.user) {
      return { error: 'userNotFound' };
    }
  }

  const extension = file.name.split('.').pop() ?? 'bin';
  const storagePath = `${userId}/${type}/${Date.now()}.${extension}`;

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from('kyc-docs')
    .upload(storagePath, fileBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data, error } = await admin
    .from('kyc_documents')
    .upsert({
      user_id: userId,
      type: parsed.data.type,
      storage_path: storagePath,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  await admin
    .from('profiles')
    .update({ kyc_status: 'pending' })
    .eq('id', userId);

  return { data };
}

export async function reviewKycDocument(input: unknown) {
  const admin = requireRole(await getProfile(), ['admin']);
  const parsed = kycReviewSchema.safeParse(input);
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
      status: parsed.data.status,
      reviewer_id: admin.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: parsed.data.rejectionReason ?? null,
    })
    .eq('id', parsed.data.documentId);

  if (error) {
    return { error: error.message };
  }

  if (parsed.data.status === 'approved') {
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
  } else {
    await supabase
      .from('profiles')
      .update({ kyc_status: 'rejected' })
      .eq('id', doc.user_id);
  }

  return { success: true };
}

export async function getKycRequirementsForRole(role: Database['public']['Enums']['user_role']) {
  return getRequiredKycDocuments(role);
}

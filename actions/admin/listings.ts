'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireRole } from '@/lib/rbac';
import { listingApproveSchema, listingRejectSchema } from '@/lib/validators/admin';
import { adminPath } from '@/lib/admin/path';
import { sanitizeText } from '@/lib/sanitize';

export async function approveListing(input: unknown) {
  requireRole(await getProfile(), ['admin']);
  const parsed = listingApproveSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('listings')
    .update({
      status: 'active',
      rejection_reason: null,
    })
    .eq('id', parsed.data.listingId)
    .eq('status', 'pending_review')
    .select('id')
    .single();

  if (error || !data) {
    return { error: 'listingNotFound' };
  }

  revalidatePath('/marketplace');
  revalidatePath(adminPath());
  revalidatePath(adminPath('listings-moderation'));
  revalidatePath(`/marketplace/${parsed.data.listingId}`);

  return { success: true };
}

export async function rejectListing(input: unknown) {
  requireRole(await getProfile(), ['admin']);
  const parsed = listingRejectSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('listings')
    .update({
      status: 'rejected',
      rejection_reason: sanitizeText(parsed.data.reason, 1000),
    })
    .eq('id', parsed.data.listingId)
    .eq('status', 'pending_review')
    .select('id, seller_id')
    .single();

  if (error || !data) {
    return { error: 'listingNotFound' };
  }

  revalidatePath(adminPath());
  revalidatePath(adminPath('listings-moderation'));
  revalidatePath('/settings');

  return { success: true };
}

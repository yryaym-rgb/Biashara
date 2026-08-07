'use server';

import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireAuth, requireKycApproved, isSellerRole } from '@/lib/rbac';
import { listingCreateSchema, listingUpdateSchema } from '@/lib/validators/listing';
import { sanitizeText } from '@/lib/sanitize';
import type { Database } from '@/types/database.types';

export async function createListing(input: unknown) {
  const profile = requireAuth(await getProfile());
  if (!isSellerRole(profile.role)) {
    return { error: 'forbidden' };
  }
  requireKycApproved(profile);

  const parsed = listingCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: profile.id,
      mineral: parsed.data.mineral as Database['public']['Enums']['mineral_type'],
      title: sanitizeText(parsed.data.title, 200),
      description: sanitizeText(parsed.data.description, 5000),
      grade: parsed.data.grade ?? null,
      purity: parsed.data.purity ?? null,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit as Database['public']['Enums']['quantity_unit'],
      price_amount: parsed.data.priceAmount ?? null,
      price_currency: parsed.data.priceCurrency,
      price_type: parsed.data.priceType,
      origin_province: parsed.data.originProvince,
      certifications: parsed.data.certifications,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function updateListing(listingId: string, input: unknown) {
  const profile = requireAuth(await getProfile());
  const parsed = listingUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const updatePayload: Database['public']['Tables']['listings']['Update'] = {};

  if (parsed.data.title) updatePayload.title = sanitizeText(parsed.data.title, 200);
  if (parsed.data.description) updatePayload.description = sanitizeText(parsed.data.description, 5000);
  if (parsed.data.grade !== undefined) updatePayload.grade = parsed.data.grade;
  if (parsed.data.purity !== undefined) updatePayload.purity = parsed.data.purity;
  if (parsed.data.quantity) updatePayload.quantity = parsed.data.quantity;
  if (parsed.data.unit) updatePayload.unit = parsed.data.unit as Database['public']['Enums']['quantity_unit'];
  if (parsed.data.priceAmount !== undefined) updatePayload.price_amount = parsed.data.priceAmount;
  if (parsed.data.priceCurrency) updatePayload.price_currency = parsed.data.priceCurrency;
  if (parsed.data.priceType) updatePayload.price_type = parsed.data.priceType;
  if (parsed.data.originProvince) updatePayload.origin_province = parsed.data.originProvince;
  if (parsed.data.certifications) updatePayload.certifications = parsed.data.certifications;
  if (parsed.data.status) updatePayload.status = parsed.data.status;

  const { data, error } = await supabase
    .from('listings')
    .update(updatePayload)
    .eq('id', listingId)
    .eq('seller_id', profile.id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function submitListingForReview(listingId: string) {
  const profile = requireAuth(await getProfile());
  requireKycApproved(profile);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('listings')
    .update({ status: 'pending_review' })
    .eq('id', listingId)
    .eq('seller_id', profile.id)
    .eq('status', 'draft')
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

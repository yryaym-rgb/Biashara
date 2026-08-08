'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireAuth, requireKycApproved, isSellerRole } from '@/lib/rbac';
import { listingCreateSchema, listingUpdateSchema } from '@/lib/validators/listing';
import { linkLotToListingAction } from '@/actions/lots';
import { sanitizeText } from '@/lib/sanitize';
import { LISTING_PHOTOS_BUCKET } from '@/lib/marketplace/photos';
import { LISTING_CREATE_STATUS } from '@/lib/marketplace/constants';
import type { Database } from '@/types/database.types';

const ALLOWED_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

function parseListingInputFromFormData(formData: FormData) {
  const certificationsRaw = formData.get('certifications');
  let certifications: string[] = [];

  if (typeof certificationsRaw === 'string' && certificationsRaw.trim()) {
    try {
      const parsed = JSON.parse(certificationsRaw) as string[];
      if (Array.isArray(parsed)) {
        certifications = parsed;
      }
    } catch {
      certifications = [];
    }
  }

  const purityRaw = formData.get('purity');
  const priceAmountRaw = formData.get('priceAmount');

  return {
    mineral: formData.get('mineral'),
    title: formData.get('title'),
    description: formData.get('description'),
    grade: formData.get('grade') || undefined,
    purity: purityRaw ? Number(purityRaw) : undefined,
    quantity: Number(formData.get('quantity')),
    unit: formData.get('unit'),
    priceType: formData.get('priceType'),
    priceAmount: priceAmountRaw ? Number(priceAmountRaw) : undefined,
    priceCurrency: 'USD',
    originProvince: formData.get('originProvince'),
    certifications,
    lotId: formData.get('lotId') || undefined,
  };
}

async function uploadListingPhotos(
  listingId: string,
  sellerId: string,
  files: File[],
): Promise<{ error?: string }> {
  const supabase = await createClient();

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    if (!file) continue;

    if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_MIME_TYPES)[number])) {
      return { error: 'invalidFileType' };
    }

    if (file.size > MAX_PHOTO_SIZE) {
      return { error: 'fileTooLarge' };
    }

    const extension = file.name.split('.').pop() ?? 'jpg';
    const storagePath = `${sellerId}/${listingId}/${index}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(LISTING_PHOTOS_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { error: insertError } = await supabase.from('listing_photos').insert({
      listing_id: listingId,
      storage_path: storagePath,
      sort_order: index,
    });

    if (insertError) {
      return { error: insertError.message };
    }
  }

  return {};
}

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

  if (
    parsed.data.priceType !== 'indicative' &&
    (parsed.data.priceAmount === undefined || parsed.data.priceAmount <= 0)
  ) {
    return { error: 'validation', details: { fieldErrors: { priceAmount: ['required'] } } };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: profile.id,
      mineral: parsed.data.mineral as Database['public']['Enums']['mineral_type'],
      title: sanitizeText(parsed.data.title, 200),
      description: sanitizeText(parsed.data.description, 5000),
      grade: parsed.data.grade ? sanitizeText(parsed.data.grade, 100) : null,
      purity: parsed.data.purity ?? null,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit as Database['public']['Enums']['quantity_unit'],
      price_amount: parsed.data.priceAmount ?? null,
      price_currency: parsed.data.priceCurrency,
      price_type: parsed.data.priceType,
      origin_province: sanitizeText(parsed.data.originProvince, 100),
      certifications: parsed.data.certifications,
      status: LISTING_CREATE_STATUS,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  if (parsed.data.lotId) {
    const linkResult = await linkLotToListingAction({
      lotId: parsed.data.lotId,
      listingId: data.id,
    });

    if (linkResult.error) {
      return { error: linkResult.error, data };
    }
  }

  return { data };
}

export async function createListingWithPhotos(formData: FormData) {
  const profile = requireAuth(await getProfile());
  if (!isSellerRole(profile.role)) {
    return { error: 'forbidden' };
  }
  requireKycApproved(profile);

  const input = parseListingInputFromFormData(formData);
  const parsed = listingCreateSchema.safeParse(input);

  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  if (
    parsed.data.priceType !== 'indicative' &&
    (parsed.data.priceAmount === undefined || parsed.data.priceAmount <= 0)
  ) {
    return { error: 'validation', details: { fieldErrors: { priceAmount: ['required'] } } };
  }

  const listingResult = await createListing(parsed.data);
  if (listingResult.error || !listingResult.data) {
    return listingResult;
  }

  const photos = formData
    .getAll('photos')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (photos.length > 0) {
    const uploadResult = await uploadListingPhotos(
      listingResult.data.id,
      profile.id,
      photos,
    );

    if (uploadResult.error) {
      return { error: uploadResult.error, data: listingResult.data };
    }
  }

  revalidatePath('/marketplace');
  return { data: listingResult.data };
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

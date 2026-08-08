'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireAuth, requireKycApproved, isCooperativeRole } from '@/lib/rbac';
import { isValidLotCode } from '@/lib/platform/custody-stages';
import {
  cooperativeSitesFormSchema,
  lotCreateSchema,
  lotCustodyCheckpointSchema,
  lotLinkListingSchema,
} from '@/lib/validators/lot';
import { sanitizeText } from '@/lib/sanitize';
import type { Database } from '@/types/database.types';

function revalidateLotPaths(lotId?: string) {
  revalidatePath('/lots');
  revalidatePath('/lots/new');
  revalidatePath('/marketplace');
  revalidatePath('/settings');
  if (lotId) {
    revalidatePath(`/lots/${lotId}`);
  }
}

function assertCooperativeAccess(profile: Awaited<ReturnType<typeof getProfile>>) {
  const authed = requireAuth(profile);
  if (!isCooperativeRole(authed.role)) {
    throw new Error('forbidden');
  }
  requireKycApproved(authed);
  return authed;
}

export async function saveCooperativeSitesAction(input: unknown) {
  let profile;
  try {
    profile = assertCooperativeAccess(await getProfile());
  } catch {
    return { error: 'forbidden' as const };
  }

  const parsed = cooperativeSitesFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation' as const, details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from('cooperative_sites')
    .delete()
    .eq('cooperative_id', profile.id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (parsed.data.sites.length > 0) {
    const rows = parsed.data.sites.map((site) => ({
      cooperative_id: profile.id,
      site_name: sanitizeText(site.siteName, 200),
      zea_reference: sanitizeText(site.zeaReference, 100),
      province: sanitizeText(site.province, 100),
    }));

    const { error: insertError } = await supabase.from('cooperative_sites').insert(rows);
    if (insertError) {
      return { error: insertError.message };
    }
  }

  revalidatePath('/settings');
  revalidatePath('/lots/new');
  return { success: true as const };
}

export async function createLotAction(input: unknown) {
  let profile;
  try {
    profile = assertCooperativeAccess(await getProfile());
  } catch {
    return { error: 'forbidden' as const };
  }

  const parsed = lotCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation' as const, details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data: site, error: siteError } = await supabase
    .from('cooperative_sites')
    .select('id, site_name, province')
    .eq('id', parsed.data.siteId)
    .eq('cooperative_id', profile.id)
    .maybeSingle();

  if (siteError) {
    return { error: siteError.message };
  }

  if (!site) {
    return { error: 'siteNotFound' as const };
  }

  const mineral = parsed.data.mineral as Database['public']['Enums']['mineral_type'];
  const { data: lotCode, error: codeError } = await supabase.rpc('generate_lot_code', {
    p_mineral: mineral,
  });

  if (codeError || !lotCode) {
    return { error: codeError?.message ?? 'lotCodeGenerationFailed' };
  }

  if (!isValidLotCode(lotCode)) {
    return { error: 'lotCodeInvalid' as const };
  }

  const extractionOccurredAt = `${parsed.data.extractionDate}T00:00:00.000Z`;
  const notes = parsed.data.notes ? sanitizeText(parsed.data.notes, 2000) : null;

  const { data: lot, error: lotError } = await supabase
    .from('lot_traceability')
    .insert({
      cooperative_id: profile.id,
      listing_id: null,
      lot_code: lotCode,
      mineral,
      initial_weight_kg: parsed.data.initialWeightKg,
      extraction_date: parsed.data.extractionDate,
      notes,
      site_id: site.id,
      origin_mine: site.site_name,
      origin_province: site.province,
      origin_country: 'CD',
    })
    .select()
    .single();

  if (lotError || !lot) {
    return { error: lotError?.message ?? 'lotCreateFailed' };
  }

  const { error: eventError } = await supabase.from('custody_events').insert({
    lot_id: lot.id,
    event_type: 'extraction',
    actor_id: profile.id,
    notes,
    occurred_at: extractionOccurredAt,
  });

  if (eventError) {
    return { error: eventError.message, data: lot };
  }

  revalidateLotPaths(lot.id);
  return { data: lot };
}

export async function addLotCustodyCheckpointAction(input: unknown) {
  let profile;
  try {
    profile = assertCooperativeAccess(await getProfile());
  } catch {
    return { error: 'forbidden' as const };
  }

  const parsed = lotCustodyCheckpointSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation' as const, details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data: lot, error: lotError } = await supabase
    .from('lot_traceability')
    .select('id')
    .eq('id', parsed.data.lotId)
    .eq('cooperative_id', profile.id)
    .maybeSingle();

  if (lotError) {
    return { error: lotError.message };
  }

  if (!lot) {
    return { error: 'lotNotFound' as const };
  }

  const { data, error } = await supabase
    .from('custody_events')
    .insert({
      lot_id: parsed.data.lotId,
      event_type: parsed.data.eventType,
      actor_id: profile.id,
      notes: sanitizeText(parsed.data.note, 500),
      occurred_at: parsed.data.occurredAt ?? new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateLotPaths(parsed.data.lotId);
  return { data };
}

export async function linkLotToListingAction(input: unknown) {
  let profile;
  try {
    profile = assertCooperativeAccess(await getProfile());
  } catch {
    return { error: 'forbidden' as const };
  }

  const parsed = lotLinkListingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation' as const, details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data: lot, error: lotError } = await supabase
    .from('lot_traceability')
    .select('id, listing_id')
    .eq('id', parsed.data.lotId)
    .eq('cooperative_id', profile.id)
    .maybeSingle();

  if (lotError) {
    return { error: lotError.message };
  }

  if (!lot) {
    return { error: 'lotNotFound' as const };
  }

  if (lot.listing_id) {
    return { error: 'lotAlreadyLinked' as const };
  }

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id')
    .eq('id', parsed.data.listingId)
    .eq('seller_id', profile.id)
    .maybeSingle();

  if (listingError) {
    return { error: listingError.message };
  }

  if (!listing) {
    return { error: 'listingNotFound' as const };
  }

  const { data, error } = await supabase
    .from('lot_traceability')
    .update({ listing_id: parsed.data.listingId })
    .eq('id', parsed.data.lotId)
    .eq('cooperative_id', profile.id)
    .is('listing_id', null)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateLotPaths(parsed.data.lotId);
  revalidatePath(`/marketplace/${parsed.data.listingId}`);
  return { data };
}

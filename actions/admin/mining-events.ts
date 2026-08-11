'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireRole } from '@/lib/rbac';
import {
  miningEventCreateSchema,
  miningEventDeleteSchema,
  miningEventUpdateSchema,
} from '@/lib/validators/admin';
import { adminMiningEventsPath } from '@/lib/admin/path';
import { sanitizeText } from '@/lib/sanitize';
import type { Database } from '@/types/database.types';

function revalidateMiningEventPaths(eventId?: string) {
  revalidatePath('/calendar');
  revalidatePath(adminMiningEventsPath());
  if (eventId) {
    revalidatePath(adminMiningEventsPath(eventId, 'edit'));
  }
}

export async function createMiningEvent(input: unknown) {
  const admin = requireRole(await getProfile(), ['admin']);
  const parsed = miningEventCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mining_events')
    .insert({
      title: sanitizeText(parsed.data.title, 200),
      description: sanitizeText(parsed.data.description, 5000),
      event_date: parsed.data.eventDate,
      category: parsed.data.category as Database['public']['Enums']['mining_event_category'],
      source_url: parsed.data.sourceUrl ?? null,
      created_by: admin.id,
    })
    .select('id')
    .single();

  if (error || !data) {
    return { error: error?.message ?? 'createFailed' };
  }

  revalidateMiningEventPaths(data.id);
  return { success: true, eventId: data.id };
}

export async function updateMiningEvent(input: unknown) {
  requireRole(await getProfile(), ['admin']);
  const parsed = miningEventUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mining_events')
    .update({
      title: sanitizeText(parsed.data.title, 200),
      description: sanitizeText(parsed.data.description, 5000),
      event_date: parsed.data.eventDate,
      category: parsed.data.category as Database['public']['Enums']['mining_event_category'],
      source_url: parsed.data.sourceUrl ?? null,
    })
    .eq('id', parsed.data.eventId)
    .select('id')
    .single();

  if (error || !data) {
    return { error: 'eventNotFound' };
  }

  revalidateMiningEventPaths(data.id);
  return { success: true };
}

export async function deleteMiningEvent(input: unknown) {
  requireRole(await getProfile(), ['admin']);
  const parsed = miningEventDeleteSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mining_events')
    .delete()
    .eq('id', parsed.data.eventId)
    .select('id')
    .single();

  if (error || !data) {
    return { error: 'eventNotFound' };
  }

  revalidateMiningEventPaths(data.id);
  return { success: true };
}

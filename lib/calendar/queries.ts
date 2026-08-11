import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { MiningEventCategory } from '@/lib/constants/mining-events';
import type { Database } from '@/types/database.types';

export type MiningEventRow = Database['public']['Tables']['mining_events']['Row'];

export interface MiningEventsResult {
  upcoming: MiningEventRow[];
  past: MiningEventRow[];
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function partitionMiningEvents(events: MiningEventRow[]): MiningEventsResult {
  const today = todayIsoDate();
  const upcoming = events
    .filter((event) => event.event_date >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
  const past = events
    .filter((event) => event.event_date < today)
    .sort((a, b) => b.event_date.localeCompare(a.event_date));

  return { upcoming, past };
}

export async function getMiningEvents(
  category?: MiningEventCategory,
): Promise<MiningEventsResult> {
  const supabase = await createClient();
  let query = supabase.from('mining_events').select('*');

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return partitionMiningEvents(data ?? []);
}

export async function getMiningEventById(eventId: string): Promise<MiningEventRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mining_events')
    .select('*')
    .eq('id', eventId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getAllMiningEventsForAdmin(): Promise<MiningEventRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mining_events')
    .select('*')
    .order('event_date', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

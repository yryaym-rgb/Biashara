import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { getCurrentCustodyStage } from '@/lib/platform/custody-stages';
import type { Database } from '@/types/database.types';
import type { CustodyStageId } from '@/lib/validators/lot';

type MineralType = Database['public']['Enums']['mineral_type'];

export type CooperativeSiteRow = Database['public']['Tables']['cooperative_sites']['Row'];

export type CustodyEventRow = Database['public']['Tables']['custody_events']['Row'];

export type LotTraceabilityRow = Database['public']['Tables']['lot_traceability']['Row'] & {
  cooperative_site: Pick<
    CooperativeSiteRow,
    'id' | 'site_name' | 'zea_reference' | 'province'
  > | null;
};

export type LotListItem = LotTraceabilityRow & {
  custody_event_count: number;
  current_stage: CustodyStageId | null;
};

export type LotDetail = LotTraceabilityRow & {
  custody_events: CustodyEventRow[];
  current_stage: CustodyStageId | null;
};

export type UnlinkedLotOption = Pick<
  LotTraceabilityRow,
  'id' | 'lot_code' | 'mineral' | 'initial_weight_kg'
>;

export async function getCooperativeSites(
  cooperativeId: string,
): Promise<CooperativeSiteRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cooperative_sites')
    .select('*')
    .eq('cooperative_id', cooperativeId)
    .order('site_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getCooperativeLots(
  cooperativeId: string,
): Promise<LotListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('lot_traceability')
    .select(
      `
        *,
        cooperative_site:cooperative_sites(id, site_name, zea_reference, province),
        custody_events(event_type)
      `,
    )
    .eq('cooperative_id', cooperativeId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const events = Array.isArray(row.custody_events) ? row.custody_events : [];
    const eventTypes = events.map((event) => event.event_type);
    const { custody_events: _custodyEvents, ...lot } = row;

    return {
      ...(lot as LotTraceabilityRow),
      custody_event_count: events.length,
      current_stage: getCurrentCustodyStage(eventTypes),
    };
  });
}

export async function getLotById(lotId: string): Promise<LotDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('lot_traceability')
    .select(
      `
        *,
        cooperative_site:cooperative_sites(id, site_name, zea_reference, province),
        custody_events(*)
      `,
    )
    .eq('id', lotId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const events = Array.isArray(data.custody_events)
    ? [...data.custody_events].sort(
        (a, b) =>
          new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime(),
      )
    : [];

  const { custody_events: _custodyEvents, ...lot } = data;

  return {
    ...(lot as LotTraceabilityRow),
    custody_events: events as CustodyEventRow[],
    current_stage: getCurrentCustodyStage(events.map((event) => event.event_type)),
  };
}

export async function getUnlinkedLotsForCooperative(
  cooperativeId: string,
): Promise<UnlinkedLotOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('lot_traceability')
    .select('id, lot_code, mineral, initial_weight_kg')
    .eq('cooperative_id', cooperativeId)
    .is('listing_id', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as UnlinkedLotOption[];
}

export async function getLotByListingId(
  listingId: string,
): Promise<Pick<LotTraceabilityRow, 'id' | 'lot_code'> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('lot_traceability')
    .select('id, lot_code')
    .eq('listing_id', listingId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getLotsByListingIds(
  listingIds: string[],
): Promise<Record<string, Pick<LotTraceabilityRow, 'id' | 'lot_code'>>> {
  if (listingIds.length === 0) {
    return {};
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('lot_traceability')
    .select('id, lot_code, listing_id')
    .in('listing_id', listingIds);

  if (error) {
    throw new Error(error.message);
  }

  const map: Record<string, Pick<LotTraceabilityRow, 'id' | 'lot_code'>> = {};
  for (const row of data ?? []) {
    if (row.listing_id) {
      map[row.listing_id] = { id: row.id, lot_code: row.lot_code };
    }
  }

  return map;
}

export function mineralToLotCodePrefix(mineral: MineralType): string {
  switch (mineral) {
    case 'cobalt':
      return 'CB';
    case 'copper':
      return 'CU';
    case 'gold':
      return 'AU';
    case 'coltan':
      return 'CT';
    case 'lithium':
      return 'LI';
    case 'diamond':
      return 'DM';
    default:
      return 'CB';
  }
}

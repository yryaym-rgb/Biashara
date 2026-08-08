import type { Database } from '@/types/database.types';
import type { CustodyStageId } from '@/lib/validators/lot';

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

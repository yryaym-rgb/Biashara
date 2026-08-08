import type { CustodyStageId } from '@/lib/validators/lot';

export const CUSTODY_STAGE_ORDER: readonly CustodyStageId[] = [
  'extraction',
  'weighing',
  'sampling',
  'analysis',
  'collection_point',
] as const;

export function getCurrentCustodyStage(
  eventTypes: string[],
): CustodyStageId | null {
  if (eventTypes.length === 0) {
    return null;
  }

  let latest: CustodyStageId | null = null;
  let latestIndex = -1;

  for (const eventType of eventTypes) {
    const index = CUSTODY_STAGE_ORDER.indexOf(eventType as CustodyStageId);
    if (index > latestIndex) {
      latestIndex = index;
      latest = eventType as CustodyStageId;
    }
  }

  return latest;
}

export function isValidLotCode(code: string): boolean {
  return /^BIA-(CB|CU|AU|CT|LI|DM)-\d{4}-\d{6}$/.test(code);
}

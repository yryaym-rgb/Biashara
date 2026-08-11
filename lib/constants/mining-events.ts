export const MINING_EVENT_CATEGORIES = [
  'auction',
  'government',
  'conference',
  'other',
] as const;

export type MiningEventCategory = (typeof MINING_EVENT_CATEGORIES)[number];

export function parseMiningEventCategory(
  value: string | undefined,
): MiningEventCategory | undefined {
  if (!value) {
    return undefined;
  }
  return MINING_EVENT_CATEGORIES.includes(value as MiningEventCategory)
    ? (value as MiningEventCategory)
    : undefined;
}

/**
 * BIASHARA mineral constants — the only allowed seed data in the application layer.
 * Justification: single source of truth for mineral metadata used by validators, API, and i18n keys.
 */

export const MINERALS = [
  {
    id: 'cobalt' as const,
    code: 'CB',
    defaultUnit: 'MT' as const,
    hasSpotPrice: true,
  },
  {
    id: 'copper' as const,
    code: 'CU',
    defaultUnit: 'MT' as const,
    hasSpotPrice: true,
  },
  {
    id: 'gold' as const,
    code: 'AU',
    defaultUnit: 'oz' as const,
    hasSpotPrice: true,
  },
  {
    id: 'coltan' as const,
    code: 'CT',
    defaultUnit: 'kg' as const,
    hasSpotPrice: false,
  },
  {
    id: 'lithium' as const,
    code: 'LI',
    defaultUnit: 'MT' as const,
    hasSpotPrice: true,
  },
  {
    id: 'diamond' as const,
    code: 'DM',
    defaultUnit: 'carat' as const,
    hasSpotPrice: false,
  },
] as const;

export type MineralId = (typeof MINERALS)[number]['id'];

export const MINERAL_IDS = MINERALS.map((m) => m.id) as readonly MineralId[];

export const QUANTITY_UNITS = ['MT', 'oz', 'kg', 'carat'] as const;
export type QuantityUnit = (typeof QUANTITY_UNITS)[number];

export function getMineralById(id: MineralId) {
  const mineral = MINERALS.find((m) => m.id === id);
  if (!mineral) {
    throw new Error(`Unknown mineral: ${id}`);
  }
  return mineral;
}

export function getDefaultUnitForMineral(id: MineralId): QuantityUnit {
  return getMineralById(id).defaultUnit;
}

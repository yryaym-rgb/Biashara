import type { MineralId } from '@/lib/constants/minerals';

/** Distinct muted tint per mineral derived from design tokens only. */
export const MINERAL_DOT_CLASS: Record<MineralId, string> = {
  cobalt: 'bg-[color-mix(in_srgb,var(--brand-blue)_55%,transparent)]',
  copper: 'bg-[color-mix(in_srgb,var(--brand-gold)_55%,transparent)]',
  gold: 'bg-[color-mix(in_srgb,var(--brand-gold)_75%,transparent)]',
  coltan: 'bg-[color-mix(in_srgb,var(--ink)_35%,transparent)]',
  lithium: 'bg-[color-mix(in_srgb,var(--brand-blue)_35%,transparent)]',
  diamond: 'bg-[color-mix(in_srgb,var(--ink)_25%,transparent)]',
};

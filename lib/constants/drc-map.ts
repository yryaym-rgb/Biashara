import type { MineralId } from '@/lib/constants/minerals';
import type { DrcProvince } from '@/lib/constants/provinces';
import { DRC_PROVINCE_PATHS, DRC_MAP_VIEWBOX } from '@/lib/constants/drc-province-paths';

/** Well-established mining geographies — publicly documented, not platform statistics. */
export const MINING_PROVINCE_MINERALS: Partial<Record<DrcProvince, MineralId[]>> = {
  'Haut-Katanga': ['cobalt', 'copper'],
  Lualaba: ['cobalt', 'copper'],
  'Kasaï-Oriental': ['diamond'],
  'Kasaï-Central': ['diamond'],
  'Nord-Kivu': ['coltan', 'gold'],
  'Sud-Kivu': ['coltan'],
  Maniema: ['coltan'],
  Ituri: ['gold'],
};

export const MINING_PROVINCES = Object.keys(MINING_PROVINCE_MINERALS) as DrcProvince[];

export function isMiningProvince(province: DrcProvince): boolean {
  return province in MINING_PROVINCE_MINERALS;
}

export interface DrcProvinceMapRegion {
  province: DrcProvince;
  /** SVG path in viewBox coordinates (from geoBoundaries ADM1 boundaries). */
  path: string;
  /** Projected centroid X for tooltip anchoring. */
  labelX: number;
  /** Projected centroid Y for tooltip anchoring. */
  labelY: number;
}

/** Real DRC province boundaries projected to SVG — generated from geoBoundaries COD ADM1. */
export const DRC_MAP_REGIONS: DrcProvinceMapRegion[] = DRC_PROVINCE_PATHS.map(
  ({ province, path, labelX, labelY }) => ({
    province,
    path,
    labelX,
    labelY,
  }),
);

export { DRC_MAP_VIEWBOX };

import type { MineralId } from '@/lib/constants/minerals';
import type { DrcProvince } from '@/lib/constants/provinces';

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
  /** Simplified SVG path in viewBox coordinates. */
  path: string;
}

/**
 * Stylized inline SVG regions for DRC provinces — geometric simplification, not cartographic accuracy.
 * Province values match DRC_PROVINCES / marketplace origin_province filter exactly.
 */
export const DRC_MAP_REGIONS: DrcProvinceMapRegion[] = [
  { province: 'Bas-Uélé', path: 'M220,40 L280,35 L295,70 L250,85 L210,65 Z' },
  { province: 'Haut-Uélé', path: 'M280,35 L340,30 L355,75 L295,70 Z' },
  { province: 'Ituri', path: 'M340,30 L380,45 L370,95 L355,75 Z' },
  { province: 'Tshopo', path: 'M210,65 L250,85 L245,130 L195,115 Z' },
  { province: 'Nord-Kivu', path: 'M355,75 L370,95 L360,145 L320,130 L295,70 Z' },
  { province: 'Maniema', path: 'M245,130 L320,130 L310,185 L230,175 Z' },
  { province: 'Sud-Kivu', path: 'M320,130 L360,145 L345,200 L310,185 Z' },
  { province: 'Tanganyika', path: 'M230,175 L310,185 L300,240 L215,225 Z' },
  { province: 'Haut-Katanga', path: 'M215,225 L300,240 L285,295 L200,280 Z' },
  { province: 'Lualaba', path: 'M200,280 L285,295 L270,350 L175,335 Z' },
  { province: 'Haut-Lomami', path: 'M175,335 L270,350 L255,395 L150,380 Z' },
  { province: 'Lomami', path: 'M150,380 L255,395 L240,440 L130,425 Z' },
  { province: 'Sankuru', path: 'M130,425 L240,440 L225,480 L115,465 Z' },
  { province: 'Kasaï-Oriental', path: 'M115,465 L225,480 L210,520 L95,505 Z' },
  { province: 'Kasaï-Central', path: 'M95,505 L210,520 L195,560 L80,545 Z' },
  { province: 'Kasaï', path: 'M80,545 L195,560 L180,600 L65,585 Z' },
  { province: 'Équateur', path: 'M40,80 L120,70 L130,150 L50,160 Z' },
  { province: 'Mongala', path: 'M50,160 L130,150 L140,210 L60,220 Z' },
  { province: 'Nord-Ubangi', path: 'M60,220 L140,210 L150,270 L70,280 Z' },
  { province: 'Sud-Ubangi', path: 'M70,280 L150,270 L160,330 L80,340 Z' },
  { province: 'Mai-Ndombe', path: 'M80,340 L160,330 L170,390 L90,400 Z' },
  { province: 'Kwilu', path: 'M90,400 L170,390 L180,450 L100,460 Z' },
  { province: 'Kwango', path: 'M100,460 L180,450 L190,510 L110,520 Z' },
  { province: 'Kinshasa', path: 'M110,520 L190,510 L200,540 L120,550 Z' },
  { province: 'Kongo-Central', path: 'M120,550 L200,540 L210,580 L100,590 Z' },
  { province: 'Tshuapa', path: 'M130,150 L195,115 L245,130 L230,175 L170,190 L140,210 Z' },
];

export const DRC_MAP_VIEWBOX = '0 0 400 600';

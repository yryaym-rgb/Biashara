import type { MineralId } from '@/lib/constants/minerals';
import type { MarketplaceListingRow } from '@/lib/marketplace/queries';
import type { Database } from '@/types/database.types';

type PriceType = Database['public']['Enums']['price_type'];

export function getPrimaryPhoto(listing: MarketplaceListingRow): string | null {
  const photos = listing.listing_photos ?? [];
  if (photos.length === 0) {
    return null;
  }
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order);
  return sorted[0]?.storage_path ?? null;
}

export function formatGradePurityLine(
  grade: string | null,
  purity: number | null,
  locale: string,
): string | null {
  const parts: string[] = [];

  if (purity !== null) {
    const formatted =
      locale === 'en'
        ? `${purity}% purity`
        : `${purity} % de pureté`;
    parts.push(formatted);
  }

  if (grade) {
    parts.push(grade);
  }

  if (parts.length === 0) {
    return null;
  }

  return parts.join(' · ');
}

export function isIndicativePrice(priceType: PriceType, mineral: MineralId): boolean {
  return priceType === 'indicative' || mineral === 'coltan' || mineral === 'diamond';
}

export function formatQuantityValue(quantity: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'fr-FR').format(quantity);
}

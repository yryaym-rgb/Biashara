import { z } from 'zod';
import { MINERAL_IDS } from '@/lib/constants/minerals';
import { DRC_PROVINCES } from '@/lib/constants/provinces';

export const MARKETPLACE_PAGE_SIZE = 10;

export const marketplaceSearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  q: z.string().max(200).optional(),
  mineral: z.enum(MINERAL_IDS as unknown as [string, ...string[]]).optional(),
  province: z.enum(DRC_PROVINCES as unknown as [string, ...string[]]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

export type MarketplaceSearchParams = z.infer<typeof marketplaceSearchParamsSchema>;

export function parseMarketplaceSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): MarketplaceSearchParams {
  const raw = {
    page: searchParams.page,
    q: typeof searchParams.q === 'string' ? searchParams.q : undefined,
    mineral: typeof searchParams.mineral === 'string' ? searchParams.mineral : undefined,
    province: typeof searchParams.province === 'string' ? searchParams.province : undefined,
    minPrice: searchParams.minPrice,
    maxPrice: searchParams.maxPrice,
  };

  return marketplaceSearchParamsSchema.parse(raw);
}

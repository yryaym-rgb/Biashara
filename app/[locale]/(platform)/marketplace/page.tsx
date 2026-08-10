import { setRequestLocale } from 'next-intl/server';
import { getProfile } from '@/lib/auth/session';
import { Container } from '@/components/ui/container';
import { MarketplaceCategoryTabs } from '@/components/marketplace/marketplace-category-tabs';
import { MarketplaceEmptyState } from '@/components/marketplace/marketplace-empty-state';
import { ListingRow } from '@/components/marketplace/listing-row';
import { MarketplacePagination } from '@/components/marketplace/marketplace-pagination';
import { MarketplaceSubheader } from '@/components/marketplace/marketplace-subheader';
import { getActiveListings } from '@/lib/marketplace/queries';
import { parseMarketplaceSearchParams } from '@/lib/marketplace/params';
import {
  buildMarketplaceQueryString,
  parseMineralParam,
  toBaseSearchParams,
} from '@/lib/marketplace/url';
import { MARKETPLACE_PAGE_SIZE } from '@/lib/marketplace/params';
import { safeQuery } from '@/lib/safe-query';

export default async function MarketplacePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const rawSearchParams = await searchParams;
  const filters = parseMarketplaceSearchParams(rawSearchParams);
  const profile = await getProfile();
  const baseSearchParams = toBaseSearchParams(filters);
  const mineral = parseMineralParam(filters.mineral);

  const { listings, total, page, pageSize } = await safeQuery(
    'marketplace/listings',
    () => getActiveListings(filters),
    {
      listings: [],
      total: 0,
      page: filters.page,
      pageSize: MARKETPLACE_PAGE_SIZE,
    },
  );

  return (
    <Container className="pb-16 md:pb-24">
      <MarketplaceSubheader
        profile={profile}
        baseSearchParams={baseSearchParams}
        initialQuery={filters.q}
        initialMineral={filters.mineral}
        initialProvince={filters.province}
        initialMinPrice={filters.minPrice !== undefined ? String(filters.minPrice) : undefined}
        initialMaxPrice={filters.maxPrice !== undefined ? String(filters.maxPrice) : undefined}
      />

      <div className="pt-6">
        <MarketplaceCategoryTabs
          activeMineral={mineral}
          baseSearchParams={baseSearchParams}
        />
      </div>

      <section className="pt-6" aria-live="polite">
        {listings.length === 0 ? (
          <MarketplaceEmptyState
            profile={profile}
            locale={locale}
            filtered={
              Boolean(
                filters.q ||
                  filters.mineral ||
                  filters.province ||
                  filters.minPrice !== undefined ||
                  filters.maxPrice !== undefined,
              )
            }
          />
        ) : (
          <>
            <div>
              {listings.map((listing) => (
                <ListingRow key={listing.id} listing={listing} locale={locale} />
              ))}
            </div>

            <MarketplacePagination
              page={page}
              total={total}
              pageSize={pageSize}
              buildHref={(nextPage) =>
                `/marketplace${buildMarketplaceQueryString(filters, { page: nextPage })}`
              }
            />
          </>
        )}
      </section>
    </Container>
  );
}

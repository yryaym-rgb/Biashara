import { setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { RfpCategoryTabs } from '@/components/rfps/rfp-category-tabs';
import { RfpEmptyState } from '@/components/rfps/rfp-empty-state';
import { RfpRowCard } from '@/components/rfps/rfp-row';
import { RfpSubheader } from '@/components/rfps/rfp-subheader';
import { MarketplacePagination } from '@/components/marketplace/marketplace-pagination';
import { getProfile } from '@/lib/auth/session';
import { getOpenRfps, parseRfpSearchParams } from '@/lib/rfps/queries';
import { parseMineralParam } from '@/lib/marketplace/url';
import type { MineralId } from '@/lib/constants/minerals';

function buildRfpQueryString(
  params: ReturnType<typeof parseRfpSearchParams>,
  overrides: { page?: number } = {},
): string {
  const search = new URLSearchParams();
  if (params.mineral) {
    search.set('mineral', params.mineral);
  }
  const page = overrides.page ?? params.page;
  if (page > 1) {
    search.set('page', String(page));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export default async function RfpsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const rawSearchParams = await searchParams;
  const filters = parseRfpSearchParams(rawSearchParams);
  const profile = await getProfile();
  const mineral = parseMineralParam(filters.mineral) as MineralId | undefined;

  const { rfps, total, page, pageSize } = await getOpenRfps(filters);

  return (
    <Container className="pb-16 md:pb-24">
      <RfpSubheader profile={profile} />

      <div className="pt-6">
        <RfpCategoryTabs
          activeMineral={mineral}
          baseSearchParams={filters.mineral ? { mineral: filters.mineral } : {}}
        />
      </div>

      <section className="pt-6" aria-live="polite">
        {rfps.length === 0 ? (
          <RfpEmptyState profile={profile} locale={locale} filtered={Boolean(filters.mineral)} />
        ) : (
          <>
            <div>
              {rfps.map((rfp) => (
                <RfpRowCard key={rfp.id} rfp={rfp} locale={locale} />
              ))}
            </div>

            <MarketplacePagination
              page={page}
              total={total}
              pageSize={pageSize}
              buildHref={(nextPage) => `/rfps${buildRfpQueryString(filters, { page: nextPage })}`}
            />
          </>
        )}
      </section>
    </Container>
  );
}

import { setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { DirectorySubheader } from '@/components/directory/directory-subheader';
import { DirectoryEmptyState } from '@/components/directory/directory-empty-state';
import { DirectoryRow } from '@/components/directory/directory-row';
import { MarketplacePagination } from '@/components/marketplace/marketplace-pagination';
import { getDirectoryEntries } from '@/lib/directory/queries';
import { parseDirectorySearchParams } from '@/lib/directory/params';
import {
  buildDirectoryQueryString,
  toDirectoryBaseSearchParams,
} from '@/lib/directory/url';

export default async function DirectoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const rawSearchParams = await searchParams;
  const filters = parseDirectorySearchParams(rawSearchParams);
  const baseSearchParams = toDirectoryBaseSearchParams(filters);

  const { entries, total, page, pageSize } = await getDirectoryEntries(filters);
  const filtered = Boolean(
    filters.q || filters.role || filters.mineral || filters.country,
  );

  return (
    <Container className="pb-16 md:pb-24">
      <DirectorySubheader
        baseSearchParams={baseSearchParams}
        initialQuery={filters.q}
        initialRole={filters.role}
        initialMineral={filters.mineral}
        initialCountry={filters.country}
      />

      <section className="pt-6" aria-live="polite">
        {entries.length === 0 ? (
          <DirectoryEmptyState locale={locale} filtered={filtered} />
        ) : (
          <>
            <div>
              {entries.map((entry) => (
                <DirectoryRow key={entry.profile.id} entry={entry} locale={locale} />
              ))}
            </div>

            <MarketplacePagination
              page={page}
              total={total}
              pageSize={pageSize}
              namespace="platform.directory"
              buildHref={(nextPage) =>
                `/directory${buildDirectoryQueryString(filters, { page: nextPage })}`
              }
            />
          </>
        )}
      </section>
    </Container>
  );
}

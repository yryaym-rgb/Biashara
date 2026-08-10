import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { requireAdminPage } from '@/lib/admin/session';
import { getListingsForModeration } from '@/lib/admin/queries';
import { safeQuery } from '@/lib/safe-query';
import { adminListingsModerationPath } from '@/lib/admin/path';
import { displayName, kycStatusVariant, listingStatusVariant } from '@/lib/admin/display';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { FileCheck } from 'lucide-react';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/admin/data-table';
import { formatDateTime } from '@/lib/utils/dates';
import { getListingPhotoPublicUrl } from '@/lib/marketplace/photos';
import { formatPricePerUnit } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Database } from '@/types/database.types';

type ListingStatus = Database['public']['Enums']['listing_status'];

const TABS: ListingStatus[] = ['pending_review', 'active', 'rejected'];

export default async function ListingsModerationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  await requireAdminPage();

  const tab = (typeof sp.tab === 'string' ? sp.tab : 'pending_review') as ListingStatus;
  const activeTab = TABS.includes(tab) ? tab : 'pending_review';

  const t = await getTranslations({ locale, namespace: 'admin.listingsModeration' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });
  const tUnits = await getTranslations({ locale, namespace: 'units' });
  const tKyc = await getTranslations({ locale, namespace: 'admin.kycStatus' });
  const tCommon = await getTranslations({ locale, namespace: 'admin.common' });

  const listings = await safeQuery(
    'admin/listings-moderation',
    () => getListingsForModeration(activeTab),
    [],
  );

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <h1>{t('title')}</h1>

      <div className="flex flex-wrap gap-6 border-b border-border">
        {TABS.map((status) => {
          const isActive = activeTab === status;
          const href =
            status === 'pending_review'
              ? adminListingsModerationPath()
              : `${adminListingsModerationPath()}?tab=${status}`;

          return (
            <Link
              key={status}
              href={href}
              className={cn(
                'relative pb-3 text-[15px] font-semibold text-body hover:text-ink',
                isActive && 'tab-active',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {t(`tabs.${status}`)}
            </Link>
          );
        })}
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon={<FileCheck className="h-5 w-5" strokeWidth={1.75} />}
          title={t(`empty.${activeTab}.title`)}
          description={t(`empty.${activeTab}.description`)}
        />
      ) : (
        <DataTable>
          <DataTableHead>
            <DataTableHeaderCell>{t('columns.listing')}</DataTableHeaderCell>
            <DataTableHeaderCell>{t('columns.seller')}</DataTableHeaderCell>
            <DataTableHeaderCell>{t('columns.quantityPrice')}</DataTableHeaderCell>
            <DataTableHeaderCell>{t('columns.submitted')}</DataTableHeaderCell>
          </DataTableHead>
          <DataTableBody>
            {listings.map((listing) => {
              const photos = [...(listing.listing_photos ?? [])].sort(
                (a, b) => a.sort_order - b.sort_order,
              );
              const thumbPath = photos[0]?.storage_path;
              const thumbUrl = thumbPath ? getListingPhotoPublicUrl(thumbPath) : null;

              return (
                <DataTableRow key={listing.id}>
                  <DataTableCell>
                    <Link
                      href={adminListingsModerationPath(listing.id)}
                      className="flex items-center gap-4"
                    >
                      {thumbUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumbUrl}
                          alt=""
                          className="h-[72px] w-[72px] rounded-button object-cover"
                        />
                      ) : (
                        <div className="h-[72px] w-[72px] rounded-button bg-bg-tint" />
                      )}
                      <div>
                        <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">
                          {tMinerals(listing.mineral)}
                        </p>
                        <p className="font-semibold text-ink">{listing.title}</p>
                      </div>
                    </Link>
                  </DataTableCell>
                  <DataTableCell>
                    <p className="font-semibold text-ink">
                      {displayName(
                        listing.seller?.company_name ?? null,
                        tCommon('unknownUser'),
                      )}
                    </p>
                    {listing.seller ? (
                      <Badge variant={kycStatusVariant(listing.seller.kyc_status)} className="mt-1">
                        {tKyc(listing.seller.kyc_status)}
                      </Badge>
                    ) : null}
                  </DataTableCell>
                  <DataTableCell>
                    <p className="tabular-nums text-ink">
                      {listing.quantity} {tUnits(listing.unit)}
                    </p>
                    {listing.price_amount !== null ? (
                      <p className="text-[13px] text-muted">
                        {formatPricePerUnit(
                          listing.price_amount,
                          listing.price_currency,
                          listing.unit,
                          locale,
                        )}
                      </p>
                    ) : null}
                  </DataTableCell>
                  <DataTableCell>{formatDateTime(listing.created_at, locale)}</DataTableCell>
                </DataTableRow>
              );
            })}
          </DataTableBody>
        </DataTable>
      )}
    </div>
  );
}

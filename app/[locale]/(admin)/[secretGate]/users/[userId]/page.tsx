import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin/session';
import { getAdminUserDetail, getKycSignedUrl } from '@/lib/admin/queries';
import { safeQuery } from '@/lib/safe-query';
import { adminUsersPath } from '@/lib/admin/path';
import { displayName, kycStatusVariant, listingStatusVariant, roleVariant } from '@/lib/admin/display';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatDateTime } from '@/lib/utils/dates';

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}) {
  const { locale, userId } = await params;
  setRequestLocale(locale);
  await requireAdminPage();

  const t = await getTranslations({ locale, namespace: 'admin.users' });
  const tRoles = await getTranslations({ locale, namespace: 'admin.roles' });
  const tKyc = await getTranslations({ locale, namespace: 'admin.kycStatus' });
  const tKycDocs = await getTranslations({ locale, namespace: 'kyc' });
  const tListingStatus = await getTranslations({ locale, namespace: 'admin.listingStatus' });
  const tCommon = await getTranslations({ locale, namespace: 'admin.common' });

  const detail = await safeQuery('admin/user-detail', () => getAdminUserDetail(userId), null);
  if (!detail) {
    notFound();
  }

  const { profile, email, kyc_documents, listings, orders } = detail;

  const kycUrls = await Promise.all(
    kyc_documents.map(async (doc) => ({
      id: doc.id,
      url: await safeQuery(
        `admin/user-detail/kyc-url/${doc.id}`,
        () => getKycSignedUrl(doc.storage_path),
        null,
      ),
    })),
  );
  const urlByDocId = Object.fromEntries(kycUrls.map((item) => [item.id, item.url]));

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 h-auto px-0 py-1">
          <Link href={adminUsersPath()}>
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            {t('backToList')}
          </Link>
        </Button>
        <h1>{displayName(profile.company_name, tCommon('unknownUser'))}</h1>
        {/* Role editing and account suspension require future schema migrations. */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.profile')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[13px] text-muted">{t('detail.email')}</p>
            <p className="text-[15px] text-ink">{email ?? tCommon('notAvailable')}</p>
          </div>
          <div>
            <p className="text-[13px] text-muted">{t('detail.role')}</p>
            <Badge variant={roleVariant(profile.role)}>{tRoles(profile.role)}</Badge>
          </div>
          <div>
            <p className="text-[13px] text-muted">{t('detail.kycStatus')}</p>
            <Badge variant={kycStatusVariant(profile.kyc_status)}>
              {tKyc(profile.kyc_status)}
            </Badge>
          </div>
          <div>
            <p className="text-[13px] text-muted">{t('detail.memberSince')}</p>
            <p className="text-[15px] text-ink">{formatDate(profile.created_at, locale)}</p>
          </div>
          <div>
            <p className="text-[13px] text-muted">{t('detail.country')}</p>
            <p className="text-[15px] text-ink">{profile.country}</p>
          </div>
          <div>
            <p className="text-[13px] text-muted">{t('detail.phone')}</p>
            <p className="text-[15px] text-ink">{profile.phone ?? tCommon('notAvailable')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.kycDocuments')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {kyc_documents.length === 0 ? (
            <p className="text-[15px] text-body">{t('detail.noKycDocuments')}</p>
          ) : (
            kyc_documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold text-ink">{tKycDocs(doc.type)}</p>
                  <Badge variant={kycStatusVariant(doc.status)} className="mt-1">
                    {tKyc(doc.status === 'approved' || doc.status === 'rejected' || doc.status === 'pending'
                      ? doc.status
                      : 'none')}
                  </Badge>
                  {doc.rejection_reason ? (
                    <p className="mt-2 text-[13px] text-danger">{doc.rejection_reason}</p>
                  ) : null}
                </div>
                {urlByDocId[doc.id] ? (
                  <a
                    href={urlByDocId[doc.id]!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[15px] font-semibold text-brand-blue hover:text-brand-blue-dark"
                  >
                    {t('detail.viewDocument')}
                  </a>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.listings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {listings.length === 0 ? (
            <p className="text-[15px] text-body">{t('detail.noListings')}</p>
          ) : (
            listings.map((listing) => (
              <div
                key={listing.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold text-ink">{listing.title}</p>
                  <Badge variant={listingStatusVariant(listing.status)} className="mt-1">
                    {tListingStatus(listing.status)}
                  </Badge>
                </div>
                <p className="text-[13px] text-muted">
                  {formatDateTime(listing.created_at, locale)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.orders')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-[15px] text-body">{t('detail.noOrders')}</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0"
              >
                <p className="font-semibold text-ink">{order.id}</p>
                <p className="text-[13px] text-muted">
                  {formatDateTime(order.created_at, locale)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

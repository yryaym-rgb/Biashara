import { setRequestLocale, getTranslations } from 'next-intl/server';
import { requireAuth } from '@/lib/rbac';
import { getProfile } from '@/lib/auth/session';
import { getUserKycDocuments, getUserListings } from '@/lib/admin/queries';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { kycStatusVariant, listingStatusVariant } from '@/lib/admin/display';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = requireAuth(await getProfile());
  const t = await getTranslations({ locale, namespace: 'platform.settings' });
  const tKyc = await getTranslations({ locale, namespace: 'kyc' });
  const tKycStatus = await getTranslations({ locale, namespace: 'admin.kycStatus' });
  const tListingStatus = await getTranslations({ locale, namespace: 'admin.listingStatus' });

  const [kycDocuments, listings] = await Promise.all([
    getUserKycDocuments(profile.id),
    getUserListings(profile.id),
  ]);

  const rejectedDocuments = kycDocuments.filter((doc) => doc.status === 'rejected');
  const sellerListings = listings.filter((listing) =>
    ['pending_review', 'active', 'rejected', 'draft', 'paused', 'sold'].includes(listing.status),
  );

  return (
    <Container className="py-12 md:py-16">
      <h1 className="mb-8">{t('title')}</h1>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('kyc')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant={kycStatusVariant(profile.kyc_status)}>
                {tKycStatus(profile.kyc_status)}
              </Badge>
              <p className="text-[15px] text-body">
                {profile.kyc_status === 'approved'
                  ? t('kycApproved')
                  : profile.kyc_status === 'rejected'
                    ? t('kycRejected')
                    : t('kycPending')}
              </p>
            </div>

            {rejectedDocuments.length > 0 ? (
              <div className="space-y-3 rounded-card border border-border bg-bg-tint p-4">
                {rejectedDocuments.map((doc) => (
                  <div key={doc.id}>
                    <p className="text-[15px] font-semibold text-ink">{tKyc(doc.type)}</p>
                    {doc.rejection_reason ? (
                      <p className="mt-1 text-[13px] text-danger">{doc.rejection_reason}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {sellerListings.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('myListings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sellerListings.map((listing) => (
                <div
                  key={listing.id}
                  className="border-b border-border pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[15px] font-semibold text-ink">{listing.title}</p>
                    <Badge variant={listingStatusVariant(listing.status)}>
                      {tListingStatus(listing.status)}
                    </Badge>
                  </div>
                  {listing.status === 'rejected' && listing.rejection_reason ? (
                    <p className="mt-2 text-[13px] text-danger">{listing.rejection_reason}</p>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </Container>
  );
}

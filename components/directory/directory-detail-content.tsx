import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Card, CardContent } from '@/components/ui/card';
import { ContactProfilePanel } from '@/components/directory/contact-profile-panel';
import { ListingRow } from '@/components/marketplace/listing-row';
import { DashboardTrustScore } from '@/components/platform/dashboard-header';
import { roleVariant } from '@/lib/admin/display';
import { formatDate } from '@/lib/utils/dates';
import type { DirectoryProfileDetail } from '@/lib/directory/queries';
import type { Profile } from '@/lib/auth/session';
import { isKycApproved, isSellerRole } from '@/lib/rbac';

export interface DirectoryDetailContentProps {
  detail: DirectoryProfileDetail;
  profile: Profile | null;
  locale: string;
}

export async function DirectoryDetailContent({
  detail,
  profile,
  locale,
}: DirectoryDetailContentProps) {
  const t = await getTranslations({ locale, namespace: 'platform.directory.detail' });
  const tList = await getTranslations({ locale, namespace: 'platform.directory' });
  const tRoles = await getTranslations({ locale, namespace: 'admin.roles' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });
  const tCountries = await getTranslations({ locale, namespace: 'platform.settings.countries' });

  const { profile: directoryProfile, province, minerals, trustScore, completedOrderCount, activeListings, contactContext } =
    detail;

  const companyName = directoryProfile.company_name ?? tList('companyUnknown');
  const memberSince = formatDate(directoryProfile.created_at, locale);
  const countryLabel = tCountries(directoryProfile.country);
  const locationLine = province ? `${countryLabel} · ${province}` : countryLabel;
  const canContact = profile
    ? isKycApproved(profile.kyc_status) && profile.id !== directoryProfile.id
    : false;
  const loginHref = `/login?redirect=${encodeURIComponent(`/directory/${directoryProfile.id}`)}`;

  return (
    <Container className="pb-16 md:pb-24">
      <div className="pt-8">
        <Button asChild variant="ghost" size="sm" className="mb-6 h-auto px-0 py-1">
          <Link href="/directory">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            {t('back')}
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
              {tList('eyebrow')}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-[34px] font-bold leading-tight text-ink">{companyName}</h1>
              <Badge variant={roleVariant(directoryProfile.role)}>
                {tRoles(directoryProfile.role)}
              </Badge>
              <Badge variant="success">{tList('kycVerified')}</Badge>
            </div>
            <p className="mt-3 text-base text-body">{locationLine}</p>
            <p className="mt-2 text-[13px] text-muted">{t('memberSince', { date: memberSince })}</p>
          </div>

          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              <h2 className="text-[18px] font-semibold text-ink">{t('companyDetails')}</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
                    {t('country')}
                  </dt>
                  <dd className="mt-1 text-base text-body">{countryLabel}</dd>
                </div>
                {province ? (
                  <div>
                    <dt className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
                      {t('province')}
                    </dt>
                    <dd className="mt-1 text-base text-body">{province}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
                    {t('completedOrders')}
                  </dt>
                  <dd className="mt-1 tabular-nums text-base font-semibold text-ink">
                    {completedOrderCount}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-3 text-[18px] font-semibold text-ink">{t('mineralsTraded')}</h2>
            {minerals.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {minerals.map((mineral) => (
                  <Badge key={mineral} variant="info">
                    {tMinerals(mineral)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-[15px] text-muted">{tList('noMinerals')}</p>
            )}
          </div>

          {isSellerRole(directoryProfile.role) ? (
            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-ink">{t('activeListings')}</h2>
              {activeListings.length > 0 ? (
                <div>
                  {activeListings.map((listing) => (
                    <ListingRow key={listing.id} listing={listing} locale={locale} />
                  ))}
                </div>
              ) : (
                <p className="text-[15px] text-muted">{t('noActiveListings')}</p>
              )}
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-6">
          <DashboardTrustScore trustScore={trustScore} />

          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              <h2 className="text-[18px] font-semibold text-ink">{t('contactTitle')}</h2>
              <p className="text-[15px] text-body">{t('contactDescription')}</p>
              <ContactProfilePanel
                targetUserId={directoryProfile.id}
                canContact={canContact}
                contactAvailable={Boolean(contactContext)}
                loginHref={loginHref}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </Container>
  );
}

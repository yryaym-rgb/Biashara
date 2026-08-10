import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { getProfile } from '@/lib/auth/session';
import { isSellerRole, isCooperativeRole } from '@/lib/rbac';
import { getUnlinkedLotsForCooperative } from '@/lib/platform/lots';
import { safeQuery } from '@/lib/safe-query';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ListingNewForm } from '@/components/marketplace/listing-new-form';
import { ShieldAlert, UserX } from 'lucide-react';

export default async function MarketplaceNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getProfile();
  const t = await getTranslations({ locale, namespace: 'platform.marketplace.new' });

  if (!profile) {
    const tErrors = await getTranslations({ locale, namespace: 'errors' });
    return (
      <Container className="py-16">
        <EmptyState
          icon={<ShieldAlert className="h-5 w-5" strokeWidth={1.75} />}
          title={tErrors('unauthorized')}
          description={t('kycBlockedDescription')}
          action={
            <Button asChild variant="primary">
              <Link href={`/login?redirect=${encodeURIComponent('/marketplace/new')}`}>
                {t('kycBlockedCta')}
              </Link>
            </Button>
          }
        />
      </Container>
    );
  }

  if (!isSellerRole(profile.role)) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={<UserX className="h-5 w-5" strokeWidth={1.75} />}
          title={t('sellerOnlyTitle')}
          description={t('sellerOnlyDescription')}
          action={
            <Button asChild variant="secondary">
              <Link href="/marketplace">{t('title')}</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  if (profile.kyc_status !== 'approved') {
    return (
      <Container className="py-16">
        <EmptyState
          icon={<ShieldAlert className="h-5 w-5" strokeWidth={1.75} />}
          title={t('kycBlockedTitle')}
          description={t('kycBlockedDescription')}
          action={
            <Button asChild variant="primary">
              <Link href="/settings">{t('kycBlockedCta')}</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  const availableLots = isCooperativeRole(profile.role)
    ? await safeQuery(
        'marketplace/new/unlinked-lots',
        () => getUnlinkedLotsForCooperative(profile.id),
        [],
      )
    : [];

  return (
    <Container className="py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-[34px] font-bold leading-tight text-ink">{t('title')}</h1>
        <p className="mt-3 text-base text-body">{t('subtitle')}</p>
        <div className="mt-8">
          <ListingNewForm
            availableLots={availableLots}
            showLotSelect={isCooperativeRole(profile.role)}
          />
        </div>
      </div>
    </Container>
  );
}

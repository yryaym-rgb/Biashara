import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { requireAuth, requireKycApproved, isCooperativeRole } from '@/lib/rbac';
import { getProfile } from '@/lib/auth/session';
import { getCooperativeLots } from '@/lib/platform/lots';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LotsListContent } from '@/components/platform/lots-list-content';
import { ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LotsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getProfile();
  const t = await getTranslations({ locale, namespace: 'platform.lots' });

  if (!profile || !isCooperativeRole(profile.role)) {
    const tErrors = await getTranslations({ locale, namespace: 'errors' });
    return (
      <Container className="py-16">
        <EmptyState
          icon={<ShieldAlert className="h-5 w-5" strokeWidth={1.75} />}
          title={tErrors('forbidden')}
          description={t('cooperativeOnly')}
        />
      </Container>
    );
  }

  if (profile.kyc_status !== 'approved') {
    return (
      <Container className="py-16">
        <EmptyState
          icon={<ShieldAlert className="h-5 w-5" strokeWidth={1.75} />}
          title={t('kycRequiredTitle')}
          description={t('kycRequiredDescription')}
          action={
            <Button asChild variant="primary">
              <Link href="/settings?tab=kyc">{t('kycRequiredCta')}</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  requireAuth(profile);
  requireKycApproved(profile);

  let lotsLoadError = false;
  const lots = await getCooperativeLots(profile.id).catch((error: unknown) => {
    console.error('[lots] Failed to load cooperative lots:', error);
    lotsLoadError = true;
    return [];
  });

  return (
    <Container className="py-12 md:py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[34px] font-bold leading-tight text-ink">{t('title')}</h1>
          <p className="mt-2 text-[15px] text-body">{t('subtitle')}</p>
        </div>
        <Button asChild variant="primary" className="w-full sm:w-auto">
          <Link href="/lots/new">{t('createCta')}</Link>
        </Button>
      </div>

      <LotsListContent lots={lots} locale={locale} loadError={lotsLoadError} />
    </Container>
  );
}

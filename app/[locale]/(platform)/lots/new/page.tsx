import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { getProfile } from '@/lib/auth/session';
import { isCooperativeRole } from '@/lib/rbac';
import { getCooperativeSites } from '@/lib/platform/lots';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LotNewForm } from '@/components/platform/lot-new-form';
import { ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LotNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getProfile();
  const t = await getTranslations({ locale, namespace: 'platform.lots.new' });

  if (!profile || !isCooperativeRole(profile.role)) {
    const tErrors = await getTranslations({ locale, namespace: 'errors' });
    return (
      <Container className="py-16">
        <EmptyState
          icon={<ShieldAlert className="h-5 w-5" strokeWidth={1.75} />}
          title={tErrors('forbidden')}
          description={t('forbidden')}
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

  const sites = await getCooperativeSites(profile.id).catch((error: unknown) => {
    console.error('[lots/new] Failed to load cooperative sites:', error);
    return [];
  });

  return (
    <Container className="py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-[34px] font-bold leading-tight text-ink">{t('title')}</h1>
        <p className="mt-3 text-base text-body">{t('subtitle')}</p>
        <div className="mt-8">
          <LotNewForm sites={sites} />
        </div>
      </div>
    </Container>
  );
}

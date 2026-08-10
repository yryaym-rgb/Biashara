import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { getProfile } from '@/lib/auth/session';
import { isCooperativeRole } from '@/lib/rbac';
import { getLotById } from '@/lib/platform/lots';
import { LotDetailContent } from '@/components/platform/lot-detail-content';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LotDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  let lotLoadError = false;
  const lot = await getLotById(id).catch((error: unknown) => {
    console.error('[lots/[id]] Failed to load lot:', error);
    lotLoadError = true;
    return null;
  });

  if (lotLoadError) {
    const t = await getTranslations({ locale, namespace: 'platform.lots' });
    return (
      <Container className="py-16">
        <EmptyState
          icon={<AlertCircle className="h-5 w-5" strokeWidth={1.75} />}
          title={t('loadErrorTitle')}
          description={t('loadErrorDescription')}
          action={
            <Button asChild variant="primary">
              <Link href="/lots">{t('loadErrorCta')}</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  if (!lot) {
    notFound();
  }

  const profile = await getProfile();
  const canEdit =
    Boolean(
      profile &&
        isCooperativeRole(profile.role) &&
        profile.kyc_status === 'approved' &&
        profile.id === lot.cooperative_id,
    );

  return <LotDetailContent lot={lot} canEdit={canEdit} locale={locale} />;
}

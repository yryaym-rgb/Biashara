import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { getProfile } from '@/lib/auth/session';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { RfpNewForm } from '@/components/rfps/rfp-new-form';
import { ShieldAlert, UserX } from 'lucide-react';

export default async function RfpNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getProfile();
  const t = await getTranslations({ locale, namespace: 'platform.rfps.new' });

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
              <Link href={`/login?redirect=${encodeURIComponent('/rfps/new')}`}>
                {t('kycBlockedCta')}
              </Link>
            </Button>
          }
        />
      </Container>
    );
  }

  if (profile.role !== 'buyer' && profile.role !== 'institution') {
    return (
      <Container className="py-16">
        <EmptyState
          icon={<UserX className="h-5 w-5" strokeWidth={1.75} />}
          title={t('buyerOnlyTitle')}
          description={t('buyerOnlyDescription')}
          action={
            <Button asChild variant="secondary">
              <Link href="/rfps">{t('backToList')}</Link>
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

  return (
    <Container className="py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-[34px] font-bold leading-tight text-ink">{t('title')}</h1>
        <p className="mt-3 text-base text-body">{t('subtitle')}</p>
        <div className="mt-8">
          <RfpNewForm />
        </div>
      </div>
    </Container>
  );
}

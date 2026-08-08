import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DashboardPersona } from '@/lib/platform/dashboard';

export interface DashboardWelcomePanelProps {
  locale: string;
  persona: DashboardPersona;
  kycApproved: boolean;
}

export async function DashboardWelcomePanel({
  locale,
  persona,
  kycApproved,
}: DashboardWelcomePanelProps) {
  const t = await getTranslations({ locale, namespace: 'platform.dashboard.welcomePanel' });

  const description =
    persona === 'seller' && kycApproved
      ? t('sellerApproved')
      : persona === 'seller'
        ? t('sellerKyc')
        : kycApproved
          ? t('buyerApproved')
          : t('buyerKyc');

  const ctaHref =
    persona === 'seller' && kycApproved ? '/marketplace/new' : '/marketplace';

  const ctaLabel =
    persona === 'seller' && kycApproved ? t('ctaPostListing') : t('ctaExplore');

  return (
    <Card>
      <CardContent className="p-8 md:p-12">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div
            className="mb-4 flex h-11 w-11 items-center justify-center rounded-button bg-bg-tint text-brand-blue"
            aria-hidden="true"
          >
            <Sparkles className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h2 className="mb-3">{t('title')}</h2>
          <p className="mb-8 text-base text-body">{description}</p>
          <Button asChild>
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

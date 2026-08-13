import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import type { Database } from '@/types/database.types';

export interface DashboardOnboardingBannerProps {
  locale: string;
  role: Database['public']['Enums']['user_role'];
  kycApproved: boolean;
}

export async function DashboardOnboardingBanner({
  locale,
  role,
  kycApproved,
}: DashboardOnboardingBannerProps) {
  const t = await getTranslations({ locale, namespace: 'platform.dashboard.onboardingBanner' });

  const isCooperative = role === 'cooperative';
  const isSeller = role === 'seller' || isCooperative;

  const description = isCooperative
    ? kycApproved
      ? t('cooperativeApproved')
      : t('cooperativeKyc')
    : isSeller
      ? kycApproved
        ? t('sellerApproved')
        : t('sellerKyc')
      : kycApproved
        ? t('buyerApproved')
        : t('buyerKyc');

  const ctaHref = isCooperative
    ? '/lots/new'
    : isSeller && kycApproved
      ? '/marketplace/new'
      : '/marketplace';

  const ctaLabel = isCooperative
    ? t('ctaPublishLot')
    : isSeller && kycApproved
      ? t('ctaPostListing')
      : t('ctaExplore');

  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-bg-tint p-4 card-shadow sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
      <div className="min-w-0">
        <p className="text-[18px] font-semibold text-ink">{t('title')}</p>
        <p className="mt-1 text-[15px] text-body">{description}</p>
      </div>
      <Button asChild className="shrink-0 self-start sm:self-center">
        <Link href={ctaHref}>
          {ctaLabel}
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

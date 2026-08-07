import { PackageOpen } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { isSellerRole } from '@/lib/rbac';
import type { Profile } from '@/lib/auth/session';

export interface MarketplaceEmptyStateProps {
  profile: Profile | null;
  locale: string;
  filtered?: boolean;
}

export async function MarketplaceEmptyState({
  profile,
  locale,
  filtered = false,
}: MarketplaceEmptyStateProps) {
  const t = await getTranslations({ locale, namespace: 'platform.marketplace' });

  const canPostFirst =
    profile &&
    isSellerRole(profile.role) &&
    profile.kyc_status === 'approved';

  const ctaHref = canPostFirst ? '/marketplace/new' : profile ? '/settings' : '/register';

  const ctaLabel = canPostFirst
    ? t('emptyCtaPost')
    : profile
      ? t('emptyCtaKyc')
      : t('emptyCtaRegister');

  return (
    <EmptyState
      icon={<PackageOpen className="h-5 w-5" strokeWidth={1.75} />}
      title={filtered ? t('emptyFiltered') : t('empty')}
      description={filtered ? t('emptyFilteredDescription') : t('emptyDescription')}
      action={
        <Button asChild variant="primary">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      }
      className="py-16"
    />
  );
}

import { ClipboardList } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import type { Profile } from '@/lib/auth/session';

export interface RfpEmptyStateProps {
  profile: Profile | null;
  locale: string;
  filtered?: boolean;
}

export async function RfpEmptyState({ profile, locale, filtered = false }: RfpEmptyStateProps) {
  const t = await getTranslations({ locale, namespace: 'platform.rfps' });

  const canPublish =
    profile &&
    (profile.role === 'buyer' || profile.role === 'institution') &&
    profile.kyc_status === 'approved';

  const ctaHref = canPublish ? '/rfps/new' : profile ? '/settings' : '/register';

  const ctaLabel = canPublish
    ? t('emptyCtaPublish')
    : profile
      ? t('emptyCtaKyc')
      : t('emptyCtaRegister');

  return (
    <EmptyState
      icon={<ClipboardList className="h-5 w-5" strokeWidth={1.75} />}
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

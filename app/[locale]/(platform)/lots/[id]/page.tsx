import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getProfile } from '@/lib/auth/session';
import { isCooperativeRole } from '@/lib/rbac';
import { getLotById } from '@/lib/platform/lots';
import { LotDetailContent } from '@/components/platform/lot-detail-content';

export default async function LotDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const lot = await getLotById(id);
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

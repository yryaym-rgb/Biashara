import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getProfile } from '@/lib/auth/session';
import { RfpDetailContent } from '@/components/rfps/rfp-detail-content';
import { getRfpById } from '@/lib/rfps/queries';
import { safeQuery } from '@/lib/safe-query';

export default async function RfpDetailPage({
  params,
}: {
  params: Promise<{ locale: string; rfpId: string }>;
}) {
  const { locale, rfpId } = await params;
  setRequestLocale(locale);

  const rfp = await safeQuery('rfps/detail', () => getRfpById(rfpId), null);
  if (!rfp) {
    notFound();
  }

  const profile = await getProfile();

  return <RfpDetailContent rfp={rfp} profile={profile} locale={locale} />;
}

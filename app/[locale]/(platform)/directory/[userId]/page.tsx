import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getProfile } from '@/lib/auth/session';
import { DirectoryDetailContent } from '@/components/directory/directory-detail-content';
import { getDirectoryProfileById } from '@/lib/directory/queries';
import { safeQuery } from '@/lib/safe-query';

export default async function DirectoryProfilePage({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}) {
  const { locale, userId } = await params;
  setRequestLocale(locale);

  const detail = await safeQuery(
    'directory/profile-detail',
    () => getDirectoryProfileById(userId),
    null,
  );
  if (!detail) {
    notFound();
  }

  const profile = await getProfile();

  return <DirectoryDetailContent detail={detail} profile={profile} locale={locale} />;
}

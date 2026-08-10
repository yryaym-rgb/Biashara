import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getProfile } from '@/lib/auth/session';
import { DirectoryDetailContent } from '@/components/directory/directory-detail-content';
import { getDirectoryProfileById } from '@/lib/directory/queries';

export default async function DirectoryProfilePage({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}) {
  const { locale, userId } = await params;
  setRequestLocale(locale);

  const detail = await getDirectoryProfileById(userId);
  if (!detail) {
    notFound();
  }

  const profile = await getProfile();

  return <DirectoryDetailContent detail={detail} profile={profile} locale={locale} />;
}

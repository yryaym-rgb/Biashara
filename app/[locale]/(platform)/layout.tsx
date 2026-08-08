import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { PlatformLayoutClient } from '@/components/platform/platform-layout-client';
import { getProfile, getUser } from '@/lib/auth/session';
import { displayName } from '@/lib/admin/display';
import { getUnreadConversationCount } from '@/lib/platform/messages';
import {
  getRecentNotifications,
  getUnreadNotificationCount,
} from '@/lib/notifications/queries';

export default async function PlatformLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getProfile();

  if (!profile) {
    return (
      <>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </>
    );
  }

  const user = await getUser();
  const tCommon = await getTranslations({ locale, namespace: 'admin.common' });
  const name = displayName(profile.company_name, user?.email ?? tCommon('unknownUser'));
  const [unreadMessagesCount, unreadNotificationsCount, recentNotifications] = await Promise.all([
    getUnreadConversationCount(profile.id),
    getUnreadNotificationCount(profile.id),
    getRecentNotifications(profile.id),
  ]);

  return (
    <PlatformLayoutClient
      displayName={name}
      companyName={profile.company_name}
      email={user?.email ?? null}
      role={profile.role}
      locale={locale}
      unreadMessagesCount={unreadMessagesCount}
      recentNotifications={recentNotifications}
      unreadNotificationsCount={unreadNotificationsCount}
    >
      {children}
    </PlatformLayoutClient>
  );
}

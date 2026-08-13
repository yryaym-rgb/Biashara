import { setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { PlatformLayoutClient } from '@/components/platform/platform-layout-client';
import { getProfile, getUser } from '@/lib/auth/session';
import { getUnreadConversationCount } from '@/lib/platform/messages';
import {
  getRecentNotifications,
  getUnreadNotificationCount,
} from '@/lib/notifications/queries';
import { safeQuery } from '@/lib/safe-query';

export const dynamic = 'force-dynamic';

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
  const [unreadMessagesCount, unreadNotificationsCount, recentNotifications] = await Promise.all([
    safeQuery('layout/unread-messages', () => getUnreadConversationCount(profile.id), 0),
    safeQuery('layout/unread-notifications', () => getUnreadNotificationCount(profile.id), 0),
    safeQuery('layout/recent-notifications', () => getRecentNotifications(profile.id), []),
  ]);

  return (
    <PlatformLayoutClient
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

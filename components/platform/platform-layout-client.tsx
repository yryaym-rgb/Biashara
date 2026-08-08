'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/lib/i18n/navigation';
import { PlatformShell } from '@/components/platform/platform-shell';
import { getPlatformNavItems, getPlatformPageTitleKey } from '@/lib/platform/nav';
import type { NotificationRow } from '@/lib/notifications/types';
import type { Database } from '@/types/database.types';

export interface PlatformLayoutClientProps {
  children: React.ReactNode;
  displayName: string;
  email: string | null;
  role: Database['public']['Enums']['user_role'];
  locale: string;
  unreadMessagesCount?: number;
  recentNotifications?: NotificationRow[];
  unreadNotificationsCount?: number;
}

export function PlatformLayoutClient({
  children,
  displayName,
  email,
  role,
  locale,
  unreadMessagesCount = 0,
  recentNotifications = [],
  unreadNotificationsCount = 0,
}: PlatformLayoutClientProps) {
  const pathname = usePathname();
  const titleKey = getPlatformPageTitleKey(pathname);
  const t = useTranslations();
  const pageTitle = t(titleKey);
  const navItems = getPlatformNavItems(role);

  return (
    <PlatformShell
      pageTitle={pageTitle}
      displayName={displayName}
      email={email}
      role={role}
      locale={locale}
      navItems={navItems}
      unreadMessagesCount={unreadMessagesCount}
      recentNotifications={recentNotifications}
      unreadNotificationsCount={unreadNotificationsCount}
    >
      {children}
    </PlatformShell>
  );
}

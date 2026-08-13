import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { AdminShell } from '@/components/admin/admin-shell';
import { AdminLoginForm } from '@/components/admin/admin-login-form';
import { PassphraseGateForm } from '@/components/admin/passphrase-gate-form';
import { getAdminSessionInfo } from '@/actions/admin/auth';
import { hasAdminGateAccess, isValidAdminGateSegment } from '@/lib/admin/gate';
import { getProfile } from '@/lib/auth/session';
import { displayName } from '@/lib/admin/display';
import {
  getRecentNotifications,
  getUnreadNotificationCount,
} from '@/lib/notifications/queries';
import { safeQuery } from '@/lib/safe-query';
import {
  adminAuditLogPath,
  adminKycReviewPath,
  adminListingsModerationPath,
  adminMiningEventsPath,
  adminPath,
  adminReportsPath,
  adminUsersPath,
} from '@/lib/admin/path';
import type { AdminNavGroup } from '@/components/admin/admin-nav';
import { AdminCommandPaletteProvider } from '@/components/admin/admin-command-palette';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SecretGateAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; secretGate: string }>;
}) {
  const { locale, secretGate } = await params;
  setRequestLocale(locale);

  if (!isValidAdminGateSegment(secretGate)) {
    notFound();
  }

  const gateOpen = await hasAdminGateAccess();
  if (!gateOpen) {
    return <PassphraseGateForm />;
  }

  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return <AdminLoginForm />;
  }

  const { profile: adminProfile, email } = await getAdminSessionInfo();
  const adminName = displayName(adminProfile.company_name, email ?? 'Admin');

  const [unreadNotificationsCount, recentNotifications] = await Promise.all([
    safeQuery('admin/layout/unread-notifications', () => getUnreadNotificationCount(adminProfile.id), 0),
    safeQuery('admin/layout/recent-notifications', () => getRecentNotifications(adminProfile.id), []),
  ]);

  const navGroups: AdminNavGroup[] = [
    {
      key: 'pilotage',
      items: [{ key: 'dashboard', href: adminPath() }],
    },
    {
      key: 'utilisateurs',
      items: [
        { key: 'users', href: adminUsersPath() },
        { key: 'kycReview', href: adminKycReviewPath() },
      ],
    },
    {
      key: 'marche',
      items: [
        {
          key: 'listings',
          href: `${adminListingsModerationPath()}?tab=active`,
          tab: 'active',
        },
        { key: 'listingsModeration', href: adminListingsModerationPath() },
        { key: 'miningEvents', href: adminMiningEventsPath() },
      ],
    },
    {
      key: 'intelligence',
      items: [{ key: 'reports', href: adminReportsPath() }],
    },
    {
      key: 'securite',
      items: [{ key: 'auditLog', href: adminAuditLogPath() }],
    },
  ];

  return (
    <AdminCommandPaletteProvider>
      <AdminShell
        adminName={adminName}
        adminEmail={email}
        locale={locale}
        navGroups={navGroups}
        recentNotifications={recentNotifications}
        unreadNotificationsCount={unreadNotificationsCount}
      >
        {children}
      </AdminShell>
    </AdminCommandPaletteProvider>
  );
}

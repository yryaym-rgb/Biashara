'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { logoutAction } from '@/actions/auth';
import { LogoutConfirmDialog } from '@/components/auth/logout-confirm-dialog';
import { AdminMenuButton } from '@/components/admin/admin-shell';
import { CommandPaletteTrigger } from '@/components/platform/command-palette';
import { NotificationBell } from '@/components/platform/notification-bell';
import { UserAvatarMenu } from '@/components/platform/user-avatar-menu';
import { Badge } from '@/components/ui/badge';
import { roleVariant } from '@/lib/admin/display';
import type { NotificationRow } from '@/lib/notifications/types';
import type { Database } from '@/types/database.types';
import type { Locale } from '@/lib/i18n/config';

export interface PlatformTopBarProps {
  pageTitle: string;
  displayName: string;
  companyName: string | null;
  email: string | null;
  role: Database['public']['Enums']['user_role'];
  locale: string;
  onMenuClick: () => void;
  menuButtonLabel: string;
  recentNotifications: NotificationRow[];
  unreadNotificationsCount: number;
}

export function PlatformTopBar({
  pageTitle,
  displayName,
  companyName,
  email,
  role,
  locale,
  onMenuClick,
  menuButtonLabel,
  recentNotifications,
  unreadNotificationsCount,
}: PlatformTopBarProps) {
  const tRoles = useTranslations('admin.roles');
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  return (
    <>
      <header className="flex h-[72px] items-center justify-between gap-4 border-b border-border bg-bg px-4 md:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <AdminMenuButton onClick={onMenuClick} label={menuButtonLabel} />
          <h1 className="truncate text-[18px] font-semibold text-ink">{pageTitle}</h1>
        </div>

        <div className="flex shrink-0 items-center gap-3 md:gap-4">
          <CommandPaletteTrigger />
          <NotificationBell
            notifications={recentNotifications}
            unreadCount={unreadNotificationsCount}
            locale={locale}
          />

          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-[15px] font-semibold text-ink">{displayName}</p>
              <Badge variant={roleVariant(role)} className="mt-1">
                {tRoles(role)}
              </Badge>
            </div>
          </div>

          <UserAvatarMenu
            companyName={companyName}
            email={email}
            onLogoutRequest={() => setLogoutDialogOpen(true)}
          />
        </div>
      </header>
      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={async () => {
          await logoutAction(locale as Locale);
        }}
      />
    </>
  );
}

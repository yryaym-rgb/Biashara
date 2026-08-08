'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { logoutAction } from '@/actions/auth';
import { LogoutConfirmDialog } from '@/components/auth/logout-confirm-dialog';
import { AdminMenuButton } from '@/components/admin/admin-shell';
import { CommandPaletteTrigger } from '@/components/platform/command-palette';
import { NotificationBell } from '@/components/platform/notification-bell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { roleVariant } from '@/lib/admin/display';
import type { NotificationRow } from '@/lib/notifications/types';
import type { Database } from '@/types/database.types';
import type { Locale } from '@/lib/i18n/config';

export interface PlatformTopBarProps {
  pageTitle: string;
  displayName: string;
  email: string | null;
  role: Database['public']['Enums']['user_role'];
  locale: string;
  onMenuClick: () => void;
  menuButtonLabel: string;
  recentNotifications: NotificationRow[];
  unreadNotificationsCount: number;
}

function avatarInitial(displayName: string, email: string | null): string {
  const source = displayName.trim() || email?.trim() || '?';
  return source.charAt(0).toUpperCase();
}

export function PlatformTopBar({
  pageTitle,
  displayName,
  email,
  role,
  locale,
  onMenuClick,
  menuButtonLabel,
  recentNotifications,
  unreadNotificationsCount,
}: PlatformTopBarProps) {
  const t = useTranslations('platform.shell');
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
          <div
            className="flex h-10 w-10 items-center justify-center rounded-button bg-bg-tint text-[15px] font-semibold text-brand-blue"
            aria-hidden="true"
          >
            {avatarInitial(displayName, email)}
          </div>
          <div className="text-right">
            <p className="text-[15px] font-semibold text-ink">{displayName}</p>
            <Badge variant={roleVariant(role)} className="mt-1">
              {tRoles(role)}
            </Badge>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setLogoutDialogOpen(true)}
        >
          {t('logout')}
        </Button>
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

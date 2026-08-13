'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { logoutAction } from '@/actions/auth';
import { LogoutConfirmDialog } from '@/components/auth/logout-confirm-dialog';
import { AdminMenuButton } from '@/components/admin/admin-shell';
import { CommandPaletteTrigger } from '@/components/platform/command-palette';
import { NotificationBell } from '@/components/platform/notification-bell';
import { UserAvatarMenu } from '@/components/platform/user-avatar-menu';
import { Badge } from '@/components/ui/badge';
import { roleVariant } from '@/lib/admin/display';
import { cn } from '@/lib/utils/cn';
import type { NotificationRow } from '@/lib/notifications/types';
import type { Database } from '@/types/database.types';
import type { Locale } from '@/lib/i18n/config';

export interface PlatformTopBarProps {
  pageTitle: string;
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

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <CommandPaletteTrigger />
          <NotificationBell
            notifications={recentNotifications}
            unreadCount={unreadNotificationsCount}
            locale={locale}
          />

          <Badge variant={roleVariant(role)} className="shrink-0">
            <span aria-hidden="true">● </span>
            {tRoles(role)}
          </Badge>

          <div
            className={cn(
              'relative inline-flex items-center gap-0.5 rounded-button border border-border bg-bg px-1.5 py-0.5',
              '[&>div>button]:h-8 [&>div>button]:w-8 [&>div>button]:bg-transparent [&>div>button]:hover:bg-transparent',
            )}
          >
            <UserAvatarMenu
              companyName={companyName}
              email={email}
              onLogoutRequest={() => setLogoutDialogOpen(true)}
            />
            <ChevronDown className="h-3.5 w-3.5 pr-0.5 text-muted" aria-hidden="true" />
          </div>
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

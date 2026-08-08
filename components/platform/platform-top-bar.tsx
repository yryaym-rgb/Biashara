'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Bell } from 'lucide-react';
import { logoutAction } from '@/actions/auth';
import { AdminMenuButton } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { roleVariant } from '@/lib/admin/display';
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
}: PlatformTopBarProps) {
  const t = useTranslations('platform.shell');
  const tRoles = useTranslations('admin.roles');
  const [isPending, startTransition] = useTransition();

  return (
    <header className="flex h-[72px] items-center justify-between gap-4 border-b border-border bg-bg px-4 md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <AdminMenuButton onClick={onMenuClick} label={menuButtonLabel} />
        <h1 className="truncate text-[18px] font-semibold text-ink">{pageTitle}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-button border border-border bg-bg text-brand-blue hover:bg-bg-tint motion-safe:transition-colors motion-safe:duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label={t('notifications')}
        >
          <Bell className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </button>

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
          loading={isPending}
          onClick={() => {
            startTransition(async () => {
              await logoutAction(locale as Locale);
            });
          }}
        >
          {t('logout')}
        </Button>
      </div>
    </header>
  );
}

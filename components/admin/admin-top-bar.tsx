'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { adminLogoutAction } from '@/actions/admin/auth';
import { Button } from '@/components/ui/button';
import { AdminMenuButton } from '@/components/admin/admin-shell';
import type { Locale } from '@/lib/i18n/config';

export interface AdminTopBarProps {
  adminName: string;
  adminEmail: string | null;
  locale: string;
  onMenuClick: () => void;
  menuButtonLabel: string;
}

export function AdminTopBar({
  adminName,
  adminEmail,
  locale,
  onMenuClick,
  menuButtonLabel,
}: AdminTopBarProps) {
  const t = useTranslations('admin.shell');
  const [isPending, startTransition] = useTransition();

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-border bg-bg px-4 md:px-8">
      <AdminMenuButton onClick={onMenuClick} label={menuButtonLabel} />
      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="text-right">
          <p className="text-[15px] font-semibold text-ink">{adminName}</p>
          {adminEmail ? (
            <p className="text-[13px] text-muted">{adminEmail}</p>
          ) : null}
        </div>
        <Button
          variant="secondary"
          size="sm"
          loading={isPending}
          onClick={() => {
            startTransition(async () => {
              await adminLogoutAction(locale as Locale);
            });
          }}
        >
          {t('logout')}
        </Button>
      </div>
    </header>
  );
}

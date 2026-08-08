'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { adminLogoutAction } from '@/actions/admin/auth';
import { LogoutConfirmDialog } from '@/components/auth/logout-confirm-dialog';
import { Button } from '@/components/ui/button';
import { AdminMenuButton } from '@/components/admin/admin-shell';
import { AdminCommandPaletteTrigger } from '@/components/admin/admin-command-palette';
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
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  return (
    <>
      <header className="flex h-[72px] items-center justify-between border-b border-border bg-bg px-4 md:px-8">
      <AdminMenuButton onClick={onMenuClick} label={menuButtonLabel} />
      <div className="flex flex-1 items-center justify-end gap-4">
        <AdminCommandPaletteTrigger />
        <div className="text-right">
          <p className="text-[15px] font-semibold text-ink">{adminName}</p>
          {adminEmail ? (
            <p className="text-[13px] text-muted">{adminEmail}</p>
          ) : null}
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
          await adminLogoutAction(locale as Locale);
        }}
      />
    </>
  );
}

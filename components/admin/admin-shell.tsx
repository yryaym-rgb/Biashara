'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import { AdminNav, type AdminNavItem } from '@/components/admin/admin-nav';
import { AdminTopBar } from '@/components/admin/admin-top-bar';
import { cn } from '@/lib/utils/cn';

export interface AdminShellProps {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string | null;
  locale: string;
  navItems: AdminNavItem[];
}

export function AdminShell({ children, adminName, adminEmail, locale, navItems }: AdminShellProps) {
  const t = useTranslations('admin.shell');
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-[240px] border-r border-border bg-bg-tint',
            'motion-safe:transition-transform motion-safe:duration-150',
            'lg:static lg:translate-x-0',
            drawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          )}
          aria-label={t('sidebarLabel')}
        >
          <div className="flex h-[72px] items-center border-b border-border px-6">
            <span className="text-[14px] font-bold tracking-[0.08em] text-ink">BIASHARA</span>
          </div>
          <AdminNav items={navItems} onNavigate={() => setDrawerOpen(false)} />
        </aside>

        {drawerOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-[color-mix(in_srgb,var(--ink)_40%,transparent)] lg:hidden"
            aria-label={t('closeDrawer')}
            onClick={() => setDrawerOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopBar
            adminName={adminName}
            adminEmail={adminEmail}
            locale={locale}
            onMenuClick={() => setDrawerOpen(true)}
            menuButtonLabel={t('openDrawer')}
          />
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>

      {drawerOpen ? (
        <button
          type="button"
          className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-button border border-border bg-bg lg:hidden"
          aria-label={t('closeDrawer')}
          onClick={() => setDrawerOpen(false)}
        >
          <X className="h-5 w-5 text-ink" strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  );
}

export function AdminMenuButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex h-11 w-11 items-center justify-center rounded-button border border-border bg-bg lg:hidden"
      aria-label={label}
      onClick={onClick}
    >
      <Menu className="h-5 w-5 text-ink" strokeWidth={1.75} />
    </button>
  );
}

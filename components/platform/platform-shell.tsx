'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { PlatformNav } from '@/components/platform/platform-nav';
import { PlatformTopBar } from '@/components/platform/platform-top-bar';
import type { PlatformNavItem } from '@/lib/platform/nav';
import type { Database } from '@/types/database.types';
import logo from '@/design/reference-logo.jpeg';
import { cn } from '@/lib/utils/cn';

export interface PlatformShellProps {
  children: React.ReactNode;
  pageTitle: string;
  displayName: string;
  email: string | null;
  role: Database['public']['Enums']['user_role'];
  locale: string;
  navItems: PlatformNavItem[];
}

export function PlatformShell({
  children,
  pageTitle,
  displayName,
  email,
  role,
  locale,
  navItems,
}: PlatformShellProps) {
  const t = useTranslations('platform.shell');
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
          <div className="flex h-[72px] items-center gap-3 border-b border-border px-6">
            <Image
              src={logo}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-[10px] object-cover"
            />
            <span className="text-[14px] font-bold tracking-[0.08em] text-ink">BIASHARA</span>
          </div>
          <PlatformNav items={navItems} onNavigate={() => setDrawerOpen(false)} />
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
          <PlatformTopBar
            pageTitle={pageTitle}
            displayName={displayName}
            email={email}
            role={role}
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

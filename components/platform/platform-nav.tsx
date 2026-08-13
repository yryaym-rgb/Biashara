'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import { Link } from '@/lib/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import type { PlatformNavSection } from '@/lib/platform/nav';
import { cn } from '@/lib/utils/cn';

export interface PlatformNavProps {
  sections: PlatformNavSection[];
  unreadMessagesCount?: number;
  onNavigate?: () => void;
}

const NAV_ITEMS_WITH_SUBTITLE = new Set(['listings', 'lots']);

export function PlatformNav({ sections, unreadMessagesCount = 0, onNavigate }: PlatformNavProps) {
  const t = useTranslations('platform.nav');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function isItemActive(key: string, href: string): boolean {
    if (key === 'listings') {
      return pathname === '/settings' && searchParams.get('tab') === 'listings';
    }
    if (key === 'settings') {
      const tab = searchParams.get('tab');
      return pathname === '/settings' && (!tab || tab === 'profile');
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="flex flex-col gap-6 p-4">
      {sections.map((section) => (
        <div key={section.key}>
          <p className="mb-2 px-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
            {t(`sections.${section.key}`)}
          </p>
          <div className="flex flex-col gap-1">
            {section.items.map((item) => {
              const isActive = isItemActive(item.key, item.href);
              const showUnreadBadge = item.key === 'messages' && unreadMessagesCount > 0;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center justify-between rounded-button px-4 py-3 text-[15px] font-semibold text-body',
                    'hover:bg-bg hover:text-ink motion-safe:transition-colors motion-safe:duration-150',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                    isActive &&
                      'border-l-[3px] border-brand-gold bg-[color-mix(in_srgb,var(--brand-blue)_10%,transparent)] pl-[13px] text-brand-blue',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  title={NAV_ITEMS_WITH_SUBTITLE.has(item.key) ? t(`${item.key}Subtitle`) : undefined}
                >
                  <span className="min-w-0">
                    <span className="block">{t(item.key)}</span>
                    {NAV_ITEMS_WITH_SUBTITLE.has(item.key) ? (
                      <span className="mt-0.5 block text-[12px] font-normal leading-snug text-muted">
                        {t(`${item.key}Subtitle`)}
                      </span>
                    ) : null}
                  </span>
                  {showUnreadBadge ? (
                    <Badge
                      variant="info"
                      aria-label={t('messagesUnread', { count: unreadMessagesCount })}
                    >
                      {unreadMessagesCount}
                    </Badge>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

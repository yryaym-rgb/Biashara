'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/lib/i18n/navigation';
import { Link } from '@/lib/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import type { PlatformNavItem } from '@/lib/platform/nav';
import { cn } from '@/lib/utils/cn';

export interface PlatformNavProps {
  items: PlatformNavItem[];
  unreadMessagesCount?: number;
  onNavigate?: () => void;
}

export function PlatformNav({ items, unreadMessagesCount = 0, onNavigate }: PlatformNavProps) {
  const t = useTranslations('platform.nav');
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-4">
      {items.map((item) => {
        const isActive =
          item.key === 'listings'
            ? pathname === '/settings'
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                'border-l-[3px] border-brand-gold bg-bg pl-[13px] text-brand-blue',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <span>{t(item.key)}</span>
            {showUnreadBadge ? (
              <Badge variant="info" aria-label={t('messagesUnread', { count: unreadMessagesCount })}>
                {unreadMessagesCount}
              </Badge>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

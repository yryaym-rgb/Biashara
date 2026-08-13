'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/lib/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils/cn';

export interface AdminNavItem {
  key: string;
  href: string;
  tab?: string;
}

export interface AdminNavGroup {
  key: string;
  items: AdminNavItem[];
}

export interface AdminNavProps {
  groups: AdminNavGroup[];
  onNavigate?: () => void;
}

function isNavItemActive(
  pathname: string,
  searchParams: URLSearchParams,
  item: AdminNavItem,
): boolean {
  const [hrefPath = '', hrefQuery = ''] = item.href.split('?');
  const hrefParams = new URLSearchParams(hrefQuery);
  const hrefTab = item.tab ?? hrefParams.get('tab');

  const pathMatches = pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
  if (!pathMatches) {
    return false;
  }

  if (!hrefTab) {
    const currentTab = searchParams.get('tab');
    return hrefPath.includes('listings-moderation') ? currentTab === null || currentTab === 'pending_review' : true;
  }

  return searchParams.get('tab') === hrefTab;
}

export function AdminNav({ groups, onNavigate }: AdminNavProps) {
  const t = useTranslations('admin.nav');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav className="flex flex-col gap-6 p-4">
      {groups.map((group) => (
        <div key={group.key}>
          <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            {t(`groups.${group.key}`)}
          </p>
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const isActive = isNavItemActive(pathname, searchParams, item);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'rounded-button px-4 py-3 text-[15px] font-semibold text-body',
                    'hover:bg-bg hover:text-ink motion-safe:transition-colors motion-safe:duration-150',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                    isActive &&
                      'border-l-[3px] border-brand-gold bg-bg pl-[13px] text-brand-blue',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

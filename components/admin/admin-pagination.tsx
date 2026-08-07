'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export interface AdminPaginationProps {
  page: number;
  total: number;
  pageSize: number;
  buildHref: (page: number) => string;
  className?: string;
}

export function AdminPagination({
  page,
  total,
  pageSize,
  buildHref,
  className,
}: AdminPaginationProps) {
  const t = useTranslations('admin.common');
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className={cn('flex items-center justify-between gap-4 pt-8', className)}
      aria-label={t('paginationLabel')}
    >
      <p className="text-[13px] text-muted">
        {t('paginationSummary', { page, totalPages })}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Button asChild variant="secondary" size="sm">
            <Link href={buildHref(page - 1)}>{t('paginationPrevious')}</Link>
          </Button>
        ) : (
          <Button variant="secondary" size="sm" disabled>
            {t('paginationPrevious')}
          </Button>
        )}
        {page < totalPages ? (
          <Button asChild variant="secondary" size="sm">
            <Link href={buildHref(page + 1)}>{t('paginationNext')}</Link>
          </Button>
        ) : (
          <Button variant="secondary" size="sm" disabled>
            {t('paginationNext')}
          </Button>
        )}
      </div>
    </nav>
  );
}

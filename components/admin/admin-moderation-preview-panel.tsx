import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import type { AdminModerationPreview } from '@/lib/admin/dashboard-moderation-preview';
import { adminListingsModerationPath } from '@/lib/admin/path';
import { formatRelativeTime } from '@/lib/utils/dates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

export interface AdminModerationPreviewPanelProps {
  preview: AdminModerationPreview;
  locale: string;
}

export async function AdminModerationPreviewPanel({
  preview,
  locale,
}: AdminModerationPreviewPanelProps) {
  const t = await getTranslations({ locale, namespace: 'admin.dashboard.moderationPreview' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });
  const tUnits = await getTranslations({ locale, namespace: 'units' });

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle>{t('title')}</CardTitle>
          {preview.pendingCount > 0 ? (
            <Badge variant="warning">{preview.pendingCount}</Badge>
          ) : null}
        </div>
        <Link
          href={adminListingsModerationPath()}
          className="text-[13px] font-semibold text-brand-blue no-underline hover:text-brand-blue-dark"
        >
          {t('openQueue')}
        </Link>
      </CardHeader>
      <CardContent>
        {preview.recentPending.length === 0 ? (
          <p className="text-[15px] text-body">{t('empty')}</p>
        ) : (
          <ul className="space-y-3">
            {preview.recentPending.map((listing) => (
              <li key={listing.id}>
                <div
                  className={cn(
                    'rounded-button border border-border bg-bg-tint p-4',
                    'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">
                      {tMinerals(listing.mineral)}
                    </p>
                    <p className="mt-1 text-[15px] font-semibold text-ink">
                      {listing.quantity} {tUnits(listing.unit)}
                    </p>
                    <p className="mt-1 text-[13px] text-muted">{listing.originProvince}</p>
                    <p className="mt-1 text-[13px] text-muted">
                      {formatRelativeTime(listing.submittedAt, locale)}
                    </p>
                  </div>
                  <Link
                    href={adminListingsModerationPath(listing.id)}
                    className="inline-flex h-9 shrink-0 items-center justify-center rounded-button bg-brand-gold px-4 text-[13px] font-semibold text-white no-underline hover:bg-brand-gold-dark"
                  >
                    {t('reviewAction')}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

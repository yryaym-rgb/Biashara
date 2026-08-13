import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import type {
  KycFunnelCounts,
  OldestPendingKycRow,
} from '@/lib/admin/dashboard-kyc-intelligence.logic';
import { adminKycReviewPath } from '@/lib/admin/path';
import { displayName } from '@/lib/admin/display';
import { formatRelativeTime } from '@/lib/utils/dates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

const FUNNEL_KEYS: Array<keyof Pick<KycFunnelCounts, 'pending' | 'needsReview' | 'verified' | 'rejected'>> =
  ['pending', 'needsReview', 'verified', 'rejected'];

export interface AdminKycIntelligencePanelProps {
  funnel: KycFunnelCounts;
  oldestPending: OldestPendingKycRow[];
  locale: string;
}

export async function AdminKycIntelligencePanel({
  funnel,
  oldestPending,
  locale,
}: AdminKycIntelligencePanelProps) {
  const t = await getTranslations({ locale, namespace: 'admin.dashboard.kycIntelligence' });
  const tCommon = await getTranslations({ locale, namespace: 'admin.common' });

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 pb-4">
        <CardTitle>{t('title')}</CardTitle>
        <Link
          href={adminKycReviewPath()}
          className="text-[13px] font-semibold text-brand-blue no-underline hover:text-brand-blue-dark"
        >
          {t('openQueue')}
        </Link>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {FUNNEL_KEYS.map((key) => (
            <div key={key} className="rounded-button border border-border bg-bg-tint p-4">
              <p className="text-[28px] font-bold tabular-nums text-ink">{funnel[key]}</p>
              <p className="mt-1 text-[13px] text-muted">{t(`funnel.${key}`)}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <p className="text-[13px] font-semibold text-ink">{t('verifiedBarLabel')}</p>
            <p className="text-[13px] font-semibold tabular-nums text-ink">
              {t('verifiedPercent', { value: funnel.verifiedPercent })}
            </p>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-bg-tint"
            role="progressbar"
            aria-valuenow={funnel.verifiedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('verifiedBarAria', { value: funnel.verifiedPercent })}
          >
            <div
              className="h-full rounded-full bg-market-live transition-[width] duration-150 ease-out"
              style={{ width: `${funnel.verifiedPercent}%` }}
            />
          </div>
          {funnel.total === 0 ? (
            <p className="mt-2 text-[13px] text-muted">{t('noDocuments')}</p>
          ) : null}
        </div>

        <div>
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">
            {t('oldestPendingTitle')}
          </p>
          {oldestPending.length === 0 ? (
            <p className="text-[15px] text-body">{t('oldestPendingEmpty')}</p>
          ) : (
            <ul className="space-y-2">
              {oldestPending.map((row) => (
                <li key={row.id}>
                  <Link
                    href={adminKycReviewPath()}
                    className={cn(
                      'flex items-center justify-between gap-4 rounded-button border border-border px-4 py-3',
                      'no-underline transition-colors hover:bg-bg-tint',
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-ink">
                        {displayName(row.companyName, tCommon('unknownUser'))}
                      </p>
                      <p className="mt-1 text-[13px] text-muted">
                        {formatRelativeTime(row.submittedAt, locale)}
                      </p>
                    </div>
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-brand-gold"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

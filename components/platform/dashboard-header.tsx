'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { roleVariant } from '@/lib/admin/display';
import { getGreetingPeriod } from '@/lib/platform/greeting';
import type { TrustScoreResult } from '@/lib/platform/trust-score';
import type { Database } from '@/types/database.types';

export interface DashboardHeaderProps {
  displayName: string;
  role: Database['public']['Enums']['user_role'];
  kycStatus: Database['public']['Enums']['kyc_status'];
}

export function DashboardHeader({ displayName, role, kycStatus }: DashboardHeaderProps) {
  const t = useTranslations('platform.dashboard.header');
  const tRoles = useTranslations('admin.roles');
  const period = getGreetingPeriod();

  return (
    <div className="space-y-3">
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
        {t(`greeting.${period}`)}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-[34px] font-bold text-ink">{displayName}</h2>
        <Badge variant={roleVariant(role)}>{tRoles(role)}</Badge>
        {kycStatus === 'approved' ? (
          <Badge variant="success">{t('kycVerified')}</Badge>
        ) : null}
      </div>
    </div>
  );
}

export interface DashboardTrustScoreProps {
  trustScore: TrustScoreResult;
}

export function DashboardTrustScore({ trustScore }: DashboardTrustScoreProps) {
  const t = useTranslations('platform.dashboard.trustScore');

  return (
    <div className="rounded-card border border-border bg-bg p-6 card-shadow">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-4">
        <h3 className="text-[18px] font-semibold text-ink">{t('title')}</h3>
        <p className="tabular-nums text-[28px] font-bold text-ink">
          {t('scoreValue', { score: trustScore.score })}
        </p>
      </div>
      <ul className="space-y-3" aria-label={t('signalsLabel')}>
        {trustScore.signals.map((signal) => (
          <li
            key={signal.key}
            className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0"
          >
            <span className="text-[15px] text-body">{t(`signals.${signal.key}.label`)}</span>
            <span
              className={`shrink-0 text-[13px] font-semibold ${signal.met ? 'text-success' : 'text-muted'}`}
            >
              {signal.key === 'kycApproved'
                ? t(`signals.${signal.key}.${signal.met ? 'yes' : 'no'}`)
                : signal.key === 'accountAge'
                  ? t(`signals.${signal.key}.value`, { days: signal.value as number })
                  : t(`signals.${signal.key}.value`, { count: signal.value as number })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

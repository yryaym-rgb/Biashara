'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { roleVariant } from '@/lib/admin/display';
import type { GreetingPeriod } from '@/lib/platform/greeting';
import type { Database } from '@/types/database.types';

export interface DashboardGreetingBarProps {
  displayName: string;
  role: Database['public']['Enums']['user_role'];
  kycStatus: Database['public']['Enums']['kyc_status'];
  /** Resolved on the server so SSR and hydration share the same time-of-day label. */
  greetingPeriod: GreetingPeriod;
}

export function DashboardGreetingBar({
  displayName,
  role,
  kycStatus,
  greetingPeriod,
}: DashboardGreetingBarProps) {
  const t = useTranslations('platform.dashboard.header');
  const tRoles = useTranslations('admin.roles');
  const period = greetingPeriod;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <h1 className="text-[18px] font-semibold text-ink">
        {t(`greeting.${period}`)}, {displayName}
      </h1>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={roleVariant(role)}>{tRoles(role)}</Badge>
        {kycStatus === 'approved' ? (
          <Badge variant="success">{t('kycVerified')}</Badge>
        ) : null}
      </div>
    </div>
  );
}

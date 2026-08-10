'use client';

import { useTranslations } from 'next-intl';
import { PublicActivityFeed } from '@/components/activity/public-activity-feed';

export function PlatformActivityWidget() {
  const t = useTranslations('activityFeed.sidebar');

  return (
    <div className="border-t border-border px-4 py-4">
      <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
        {t('title')}
      </h2>
      <PublicActivityFeed variant="sidebar" />
    </div>
  );
}

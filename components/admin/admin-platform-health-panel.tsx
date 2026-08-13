import { getTranslations } from 'next-intl/server';
import type { PlatformHealthSnapshot } from '@/lib/admin/platform-health.logic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

export interface AdminPlatformHealthPanelProps {
  health: PlatformHealthSnapshot;
  locale: string;
}

export async function AdminPlatformHealthPanel({ health, locale }: AdminPlatformHealthPanelProps) {
  const t = await getTranslations({ locale, namespace: 'admin.dashboard.platformHealth' });

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
          {t('eyebrow')}
        </p>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {health.systems.map((system) => {
            const isOperational = system.status === 'operational';
            return (
              <li
                key={system.key}
                className="flex items-center justify-between gap-4 rounded-button border border-border bg-bg-tint px-4 py-3"
              >
                <span className="text-[15px] font-semibold text-ink">{t(`systems.${system.key}`)}</span>
                <span
                  className={cn(
                    'rounded-[6px] px-2 py-1 text-[12px] font-semibold',
                    isOperational
                      ? 'bg-[color-mix(in_srgb,var(--market-live)_12%,transparent)] text-market-live'
                      : 'bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-danger',
                  )}
                >
                  {isOperational ? t('status.operational') : t('status.unavailable')}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="text-[13px] text-muted">{t('monitoringNote')}</p>
        <p className="text-[12px] text-muted">
          {t('checkedAt', {
            time: new Intl.DateTimeFormat(locale, {
              dateStyle: 'medium',
              timeStyle: 'short',
              timeZone: 'Africa/Kinshasa',
            }).format(new Date(health.checkedAt)),
          })}
        </p>
      </CardContent>
    </Card>
  );
}

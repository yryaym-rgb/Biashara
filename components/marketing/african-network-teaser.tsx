import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

/** Part J — Réseau commercial africain (coming soon) */
export async function AfricanNetworkTeaser() {
  const t = await getTranslations('marketing.landing.africanNetwork');

  return (
    <Card className="border-dashed opacity-60">
      <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
        <div className="flex w-full items-start justify-end">
          <Badge variant="warning">{t('badge')}</Badge>
        </div>

        <div
          className="flex h-24 w-full max-w-md items-center justify-center rounded-card bg-bg-tint"
          aria-hidden="true"
        >
          <svg viewBox="0 0 320 96" className="h-full w-full max-w-sm px-8" role="img" aria-label={t('illustrationLabel')}>
            <circle cx="48" cy="48" r="20" fill="color-mix(in srgb, var(--brand-blue) 20%, transparent)" />
            <circle cx="160" cy="32" r="16" fill="color-mix(in srgb, var(--brand-gold) 25%, transparent)" />
            <circle cx="272" cy="56" r="18" fill="color-mix(in srgb, var(--brand-blue) 15%, transparent)" />
            <line x1="68" y1="48" x2="144" y2="36" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="176" y1="36" x2="254" y2="52" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </div>

        <div className="space-y-2">
          <h3 className="text-[18px] font-semibold text-ink">{t('title')}</h3>
          <p className="max-w-lg text-[15px] text-body">{t('description')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ACTIVE_CURRENCY = 'USD';

const DISABLED_CURRENCIES = [
  { code: 'CDF', key: 'cdf' },
  { code: 'ZMW', key: 'zmw' },
  { code: 'TZS', key: 'tzs' },
  { code: 'RWF', key: 'rwf' },
  { code: 'KES', key: 'kes' },
  { code: 'GHS', key: 'ghs' },
  { code: 'NGN', key: 'ngn' },
  { code: 'ZAR', key: 'zar' },
] as const;

export interface CurrencySelectorComingSoonProps {
  className?: string;
}

/** Part I — Devises (coming soon) */
export function CurrencySelectorComingSoon({ className }: CurrencySelectorComingSoonProps) {
  const t = useTranslations('marketing.prices.currency');
  const tCommon = useTranslations('common');

  return (
    <Tabs value={ACTIVE_CURRENCY} onValueChange={() => undefined} className={className}>
      <TabsList className="gap-3 border-0">
        <TabsTrigger value={ACTIVE_CURRENCY} className="text-[13px]">
          {t('usd')}
        </TabsTrigger>
        {DISABLED_CURRENCIES.map(({ code, key }) => (
          <TabsTrigger
            key={code}
            value={code}
            disabled
            disabledTooltip={tCommon('comingSoon')}
            className="text-[13px]"
          >
            {t(key)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

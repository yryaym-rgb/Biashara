'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ACTIVE_COUNTRY = 'drc';

const DISABLED_COUNTRIES = [
  'zambia',
  'tanzania',
  'ghana',
  'southAfrica',
  'nigeria',
  'zimbabwe',
  'rwanda',
] as const;

export interface AfricanMarketsFilterProps {
  className?: string;
}

/** Part K — Marchés africains (coming soon) */
export function AfricanMarketsFilter({ className }: AfricanMarketsFilterProps) {
  const t = useTranslations('marketing.prices.markets');
  const tCommon = useTranslations('common');

  return (
    <Tabs value={ACTIVE_COUNTRY} onValueChange={() => undefined} className={className}>
      <TabsList className="gap-3 border-0">
        <TabsTrigger value={ACTIVE_COUNTRY} className="text-[13px]">
          {t('drc')}
        </TabsTrigger>
        {DISABLED_COUNTRIES.map((code) => (
          <TabsTrigger
            key={code}
            value={code}
            disabled
            disabledTooltip={tCommon('comingSoon')}
            className="text-[13px]"
          >
            {t(code)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

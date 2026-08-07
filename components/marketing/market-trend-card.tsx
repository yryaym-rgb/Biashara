'use client';

import { useTranslations } from 'next-intl';
import { MineralPriceChart } from '@/components/marketing/mineral-price-chart';

export function MarketTrendCard() {
  const t = useTranslations('marketing.landing.prices');

  return (
    <MineralPriceChart
      mineralId="copper"
      title={t('trendCardTitle')}
      chartHeight={240}
      translationNamespace="marketing.landing.prices"
    />
  );
}

'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { MineralId } from '@/lib/constants/minerals';
import { isIndicativePrice } from '@/lib/marketplace/format';
import { formatPricePerUnit } from '@/lib/utils/format';
import type { Database } from '@/types/database.types';

type PriceType = Database['public']['Enums']['price_type'];
type QuantityUnit = Database['public']['Enums']['quantity_unit'];

export interface ListingPriceDisplayProps {
  mineral: MineralId;
  priceAmount: number | null;
  priceCurrency: string;
  priceType: PriceType;
  unit: QuantityUnit;
  size?: 'sm' | 'lg';
  className?: string;
}

export function ListingPriceDisplay({
  mineral,
  priceAmount,
  priceCurrency,
  priceType,
  unit,
  size = 'sm',
  className,
}: ListingPriceDisplayProps) {
  const t = useTranslations('marketing.prices');
  const tUnits = useTranslations('units');
  const locale = useLocale();

  const unitLabel = tUnits(unit);
  const indicative = isIndicativePrice(priceType, mineral);

  if (indicative || priceAmount === null) {
    return (
      <span
        className={
          size === 'lg'
            ? `text-base text-body ${className ?? ''}`
            : `text-[13px] text-muted ${className ?? ''}`
        }
      >
        {t('indicative')}
      </span>
    );
  }

  return (
    <span
      className={
        size === 'lg'
          ? `tabular-nums text-[28px] font-bold text-ink ${className ?? ''}`
          : `tabular-nums text-[20px] font-bold text-ink ${className ?? ''}`
      }
    >
      {formatPricePerUnit(priceAmount, priceCurrency, unitLabel, locale)}
    </span>
  );
}

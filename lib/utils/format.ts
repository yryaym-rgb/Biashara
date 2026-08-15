import type { Locale } from '@/lib/i18n/config';

/** Maps app locale to BCP 47 tag for Intl APIs. */
export function resolveIntlLocale(locale: string): string {
  if (locale === 'en') return 'en-US';
  if (locale === 'pt') return 'pt-PT';
  return 'fr-FR';
}

export function formatCurrency(
  amount: number,
  currency: string,
  locale: string,
): string {
  const intlLocale = resolveIntlLocale(locale);
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, locale: string): string {
  const intlLocale = resolveIntlLocale(locale);
  return new Intl.NumberFormat(intlLocale).format(value);
}

/**
 * Formats a price with unit suffix, e.g. "33 250 $US/TM" (fr) or "33,250 US$/MT" (en).
 */
export function formatPricePerUnit(
  amount: number,
  currency: string,
  unit: string,
  locale: Locale | string,
): string {
  const formatted = formatNumber(amount, locale);
  const currencyLabel =
    currency === 'USD'
      ? locale === 'en'
        ? 'US$'
        : '$US'
      : currency;
  return `${formatted} ${currencyLabel}/${unit}`;
}

import { resolveIntlLocale } from '@/lib/utils/format';

/** DRC market timezone — always Africa/Kinshasa (UTC+1), never the viewer's local zone. */
export const DRC_TIMEZONE = 'Africa/Kinshasa';

export function formatKinshasaTime(date: Date | string, locale: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: DRC_TIMEZONE,
  }).format(d);
}

export function formatDate(date: Date | string, locale: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string, locale: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

const RELATIVE_TIME_UNITS: Array<{
  unit: Intl.RelativeTimeFormatUnit;
  seconds: number;
}> = [
  { unit: 'year', seconds: 60 * 60 * 24 * 365 },
  { unit: 'month', seconds: 60 * 60 * 24 * 30 },
  { unit: 'week', seconds: 60 * 60 * 24 * 7 },
  { unit: 'day', seconds: 60 * 60 * 24 },
  { unit: 'hour', seconds: 60 * 60 },
  { unit: 'minute', seconds: 60 },
  { unit: 'second', seconds: 1 },
];

export function formatRelativeTime(date: Date | string, locale: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffSeconds = Math.round((d.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const rtf = new Intl.RelativeTimeFormat(resolveIntlLocale(locale), { numeric: 'auto' });

  for (const { unit, seconds } of RELATIVE_TIME_UNITS) {
    if (absSeconds >= seconds || unit === 'second') {
      const value = Math.round(diffSeconds / seconds);
      return rtf.format(value, unit);
    }
  }

  return rtf.format(0, 'second');
}

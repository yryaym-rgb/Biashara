'use client';

import * as React from 'react';
import { formatDate, formatRelativeTime } from '@/lib/utils/dates';

export interface RelativeTimeProps {
  date: string;
  locale: string;
  className?: string;
}

/**
 * Renders a relative time label without SSR/client hydration mismatch.
 * Server and first client paint use a stable calendar date; relative text
 * is applied after mount.
 */
export function RelativeTime({ date, locale, className }: RelativeTimeProps) {
  const [label, setLabel] = React.useState(() => formatDate(date, locale));

  React.useEffect(() => {
    function refresh() {
      setLabel(formatRelativeTime(date, locale));
    }

    refresh();
    const interval = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(interval);
  }, [date, locale]);

  return (
    <time className={className} dateTime={date} suppressHydrationWarning>
      {label}
    </time>
  );
}

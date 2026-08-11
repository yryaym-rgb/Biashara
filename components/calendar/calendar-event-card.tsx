import { Calendar, ExternalLink } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/dates';
import type { MiningEventRow } from '@/lib/calendar/queries';
import { cn } from '@/lib/utils/cn';

export interface CalendarEventCardProps {
  event: MiningEventRow;
  locale: string;
  isPast?: boolean;
}

export async function CalendarEventCard({
  event,
  locale,
  isPast = false,
}: CalendarEventCardProps) {
  const t = await getTranslations({ locale, namespace: 'marketing.calendar' });

  return (
    <Card className={cn('p-6', isPast && 'opacity-80')}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-bg-tint text-brand-blue"
            aria-hidden="true"
          >
            <Calendar className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-[6px] bg-[color-mix(in_srgb,var(--brand-blue)_12%,transparent)] px-2 py-1 text-[12px] font-semibold text-brand-blue">
                {t(`categories.${event.category}`)}
              </span>
              <time
                dateTime={event.event_date}
                className="text-[13px] font-semibold tabular-nums text-muted"
              >
                {formatDate(event.event_date, locale)}
              </time>
            </div>
            <h3 className="mb-2 text-[18px] font-semibold text-ink">{event.title}</h3>
            <p className="text-base leading-relaxed text-body">{event.description}</p>
          </div>
        </div>
        {event.source_url ? (
          <a
            href={event.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 text-[13px] font-semibold text-brand-blue hover:text-brand-blue-dark motion-safe:transition-colors motion-safe:duration-150"
          >
            {t('sourceLink')}
            <ExternalLink className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </Card>
  );
}

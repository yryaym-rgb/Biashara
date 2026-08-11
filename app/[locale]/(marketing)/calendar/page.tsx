import { Calendar } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CalendarCategoryTabs } from '@/components/calendar/calendar-category-tabs';
import { CalendarEventCard } from '@/components/calendar/calendar-event-card';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeading } from '@/components/ui/section-heading';
import { parseMiningEventCategory } from '@/lib/constants/mining-events';
import { getMiningEvents } from '@/lib/calendar/queries';
import { safeQuery } from '@/lib/safe-query';

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const category = parseMiningEventCategory(
    typeof sp.category === 'string' ? sp.category : undefined,
  );

  const t = await getTranslations('marketing.calendar');

  const { upcoming, past } = await safeQuery(
    'calendar/events',
    () => getMiningEvents(category),
    { upcoming: [], past: [] },
  );

  const hasEvents = upcoming.length > 0 || past.length > 0;
  const isFiltered = Boolean(category);

  return (
    <section className="bg-bg py-14 lg:py-24">
      <Container>
        <SectionHeading
          as="h1"
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
          className="mb-12"
        />

        <div className="mb-8">
          <CalendarCategoryTabs activeCategory={category} />
        </div>

        {!hasEvents ? (
          <EmptyState
            icon={<Calendar className="h-5 w-5" strokeWidth={1.75} />}
            title={isFiltered ? t('emptyFiltered.title') : t('empty.title')}
            description={isFiltered ? t('emptyFiltered.description') : t('empty.description')}
          />
        ) : (
          <div className="space-y-12">
            {upcoming.length > 0 ? (
              <section aria-labelledby="upcoming-events-heading">
                <h2 id="upcoming-events-heading" className="mb-6">
                  {t('upcoming')}
                </h2>
                <div className="grid gap-4">
                  {upcoming.map((event) => (
                    <CalendarEventCard key={event.id} event={event} locale={locale} />
                  ))}
                </div>
              </section>
            ) : null}

            {past.length > 0 ? (
              <section aria-labelledby="past-events-heading">
                <h2 id="past-events-heading" className="mb-6">
                  {t('past')}
                </h2>
                <div className="grid gap-4">
                  {past.map((event) => (
                    <CalendarEventCard
                      key={event.id}
                      event={event}
                      locale={locale}
                      isPast
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </Container>
    </section>
  );
}

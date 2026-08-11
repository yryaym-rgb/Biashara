import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { requireAdminPage } from '@/lib/admin/session';
import { getMiningEventById } from '@/lib/calendar/queries';
import { adminMiningEventsPath } from '@/lib/admin/path';
import { safeQuery } from '@/lib/safe-query';
import { MiningEventForm } from '@/components/admin/mining-event-form';

export default async function AdminMiningEventEditPage({
  params,
}: {
  params: Promise<{ locale: string; eventId: string }>;
}) {
  const { locale, eventId } = await params;
  setRequestLocale(locale);
  await requireAdminPage();

  const event = await safeQuery(
    `admin/mining-events/${eventId}`,
    () => getMiningEventById(eventId),
    null,
  );

  if (!event) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'admin.miningEvents' });

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div>
        <Link
          href={adminMiningEventsPath()}
          className="mb-4 inline-block text-[13px] font-semibold text-brand-blue hover:text-brand-blue-dark"
        >
          {t('backToList')}
        </Link>
        <h1>{t('editTitle')}</h1>
      </div>

      <MiningEventForm mode="edit" event={event} cancelHref={adminMiningEventsPath()} />
    </div>
  );
}

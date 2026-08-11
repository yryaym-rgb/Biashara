import { Plus } from 'lucide-react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { requireAdminPage } from '@/lib/admin/session';
import { getAllMiningEventsForAdmin } from '@/lib/calendar/queries';
import { adminMiningEventsNewPath, adminMiningEventsPath } from '@/lib/admin/path';
import { safeQuery } from '@/lib/safe-query';
import { formatDate } from '@/lib/utils/dates';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/admin/data-table';
import { MiningEventDeleteButton } from '@/components/admin/mining-event-form';

export default async function AdminMiningEventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdminPage();

  const t = await getTranslations({ locale, namespace: 'admin.miningEvents' });
  const tCategories = await getTranslations({ locale, namespace: 'marketing.calendar.categories' });

  const events = await safeQuery(
    'admin/mining-events',
    () => getAllMiningEventsForAdmin(),
    [],
  );

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1>{t('title')}</h1>
        <Button asChild>
          <Link href={adminMiningEventsNewPath()}>
            <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            {t('create')}
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-5 w-5" strokeWidth={1.75} />}
          title={t('empty.title')}
          description={t('empty.description')}
          action={
            <Button asChild>
              <Link href={adminMiningEventsNewPath()}>{t('create')}</Link>
            </Button>
          }
        />
      ) : (
        <DataTable>
          <DataTableHead>
            <DataTableHeaderCell>{t('columns.title')}</DataTableHeaderCell>
            <DataTableHeaderCell>{t('columns.date')}</DataTableHeaderCell>
            <DataTableHeaderCell>{t('columns.category')}</DataTableHeaderCell>
            <DataTableHeaderCell>{t('columns.actions')}</DataTableHeaderCell>
          </DataTableHead>
          <DataTableBody>
            {events.map((event) => (
              <DataTableRow key={event.id}>
                <DataTableCell>{event.title}</DataTableCell>
                <DataTableCell>{formatDate(event.event_date, locale)}</DataTableCell>
                <DataTableCell>{tCategories(event.category)}</DataTableCell>
                <DataTableCell>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={adminMiningEventsPath(event.id, 'edit')}
                      className="text-[13px] font-semibold text-brand-blue hover:text-brand-blue-dark"
                    >
                      {t('edit')}
                    </Link>
                    <MiningEventDeleteButton eventId={event.id} />
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      )}
    </div>
  );
}

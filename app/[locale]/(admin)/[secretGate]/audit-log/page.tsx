import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { requireAdminPage } from '@/lib/admin/session';
import { getAuditLog, AUDIT_PAGE_SIZE } from '@/lib/admin/queries';
import { safeQuery } from '@/lib/safe-query';
import { adminAuditLogPath, adminUsersPath, adminListingsModerationPath } from '@/lib/admin/path';
import { displayName } from '@/lib/admin/display';
import { EmptyState } from '@/components/ui/empty-state';
import { ScrollText } from 'lucide-react';
import { Input, Select } from '@/components/ui/input';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/admin/data-table';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { AuditDiffPanel } from '@/components/admin/audit-diff-panel';
import { formatDateTime } from '@/lib/utils/dates';

const ENTITY_OPTIONS = ['kyc_documents', 'listings', 'offers', 'orders'] as const;
const ACTION_OPTIONS = ['insert', 'update', 'delete'] as const;

function buildEntityLink(entity: string, entityId: string | null): string | null {
  if (!entityId) return null;
  if (entity === 'profiles' || entity === 'kyc_documents') {
    return adminUsersPath(entityId);
  }
  if (entity === 'listings') {
    return adminListingsModerationPath(entityId);
  }
  return null;
}

export default async function AdminAuditLogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  await requireAdminPage();

  const t = await getTranslations({ locale, namespace: 'admin.auditLog' });
  const tCommon = await getTranslations({ locale, namespace: 'admin.common' });

  const page = Number(sp.page) || 1;
  const entity = typeof sp.entity === 'string' ? sp.entity : undefined;
  const action = typeof sp.action === 'string' ? sp.action : undefined;
  const dateFrom = typeof sp.dateFrom === 'string' ? sp.dateFrom : undefined;
  const dateTo = typeof sp.dateTo === 'string' ? sp.dateTo : undefined;

  const { entries, total, pageSize } = await safeQuery(
    'admin/audit-log',
    () => getAuditLog({ page, entity, action, dateFrom, dateTo }),
    { entries: [], total: 0, page, pageSize: AUDIT_PAGE_SIZE },
  );

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (entity) params.set('entity', entity);
    if (action) params.set('action', action);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (nextPage > 1) params.set('page', String(nextPage));
    const query = params.toString();
    return query ? `${adminAuditLogPath()}?${query}` : adminAuditLogPath();
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <h1>{t('title')}</h1>

      <form method="get" className="grid gap-4 md:grid-cols-5">
        <Select
          name="entity"
          defaultValue={entity ?? ''}
          placeholder={t('filterEntity')}
          options={ENTITY_OPTIONS.map((value) => ({
            value,
            label: t(`entities.${value}`),
          }))}
          aria-label={t('filterEntity')}
        />
        <Select
          name="action"
          defaultValue={action ?? ''}
          placeholder={t('filterAction')}
          options={ACTION_OPTIONS.map((value) => ({
            value,
            label: t(`actions.${value}`),
          }))}
          aria-label={t('filterAction')}
        />
        <Input
          type="date"
          name="dateFrom"
          defaultValue={dateFrom}
          aria-label={t('filterDateFrom')}
        />
        <Input
          type="date"
          name="dateTo"
          defaultValue={dateTo}
          aria-label={t('filterDateTo')}
        />
        <button
          type="submit"
          className="h-[46px] rounded-button border border-border bg-bg px-4 text-[15px] font-semibold text-ink hover:bg-bg-tint"
        >
          {tCommon('applyFilters')}
        </button>
      </form>

      {entries.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="h-5 w-5" strokeWidth={1.75} />}
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        />
      ) : (
        <>
          <DataTable>
            <DataTableHead>
              <DataTableHeaderCell>{t('columns.actor')}</DataTableHeaderCell>
              <DataTableHeaderCell>{t('columns.action')}</DataTableHeaderCell>
              <DataTableHeaderCell>{t('columns.entity')}</DataTableHeaderCell>
              <DataTableHeaderCell>{t('columns.timestamp')}</DataTableHeaderCell>
            </DataTableHead>
            <DataTableBody>
              {entries.map((entry) => {
                const entityHref = buildEntityLink(entry.entity, entry.entity_id);

                return (
                  <DataTableRow key={entry.id}>
                    <DataTableCell>
                      {displayName(entry.actor_name, tCommon('unknownActor'))}
                    </DataTableCell>
                    <DataTableCell>{t(`actions.${entry.action}` as 'actions.insert')}</DataTableCell>
                    <DataTableCell>
                      <div>
                        <p>
                          {t(`entities.${entry.entity}` as 'entities.listings')}
                          {entry.entity_id ? (
                            <>
                              {' '}
                              {entityHref ? (
                                <Link
                                  href={entityHref}
                                  className="font-semibold text-brand-blue hover:text-brand-blue-dark"
                                >
                                  {entry.entity_id}
                                </Link>
                              ) : (
                                <span className="text-muted">{entry.entity_id}</span>
                              )}
                            </>
                          ) : null}
                        </p>
                        <AuditDiffPanel diff={entry.diff} />
                      </div>
                    </DataTableCell>
                    <DataTableCell>{formatDateTime(entry.created_at, locale)}</DataTableCell>
                  </DataTableRow>
                );
              })}
            </DataTableBody>
          </DataTable>
          <AdminPagination
            page={page}
            total={total}
            pageSize={pageSize}
            buildHref={buildHref}
          />
        </>
      )}
    </div>
  );
}

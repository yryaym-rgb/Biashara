import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { requireAdminPage } from '@/lib/admin/session';
import { getAdminUsers, USERS_PAGE_SIZE } from '@/lib/admin/queries';
import { safeQuery } from '@/lib/safe-query';
import { adminUsersPath } from '@/lib/admin/path';
import { displayName, kycStatusVariant, roleVariant } from '@/lib/admin/display';
import { Badge } from '@/components/ui/badge';
import { Input, Select } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { Users } from 'lucide-react';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/admin/data-table';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { formatRelativeTime } from '@/lib/utils/dates';
import type { Database } from '@/types/database.types';

type UserRole = Database['public']['Enums']['user_role'];
type KycStatus = Database['public']['Enums']['kyc_status'];

export default async function AdminUsersPage({
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

  const t = await getTranslations({ locale, namespace: 'admin.users' });
  const tRoles = await getTranslations({ locale, namespace: 'admin.roles' });
  const tKyc = await getTranslations({ locale, namespace: 'admin.kycStatus' });
  const tCommon = await getTranslations({ locale, namespace: 'admin.common' });

  const page = Number(sp.page) || 1;
  const q = typeof sp.q === 'string' ? sp.q : undefined;
  const role = typeof sp.role === 'string' ? (sp.role as UserRole) : undefined;
  const kycStatus = typeof sp.kycStatus === 'string' ? (sp.kycStatus as KycStatus) : undefined;

  const { users, total, pageSize } = await safeQuery(
    'admin/users',
    () => getAdminUsers({ page, q, role, kycStatus }),
    { users: [], total: 0, page, pageSize: USERS_PAGE_SIZE },
  );

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (role) params.set('role', role);
    if (kycStatus) params.set('kycStatus', kycStatus);
    if (nextPage > 1) params.set('page', String(nextPage));
    const query = params.toString();
    return query ? `${adminUsersPath()}?${query}` : adminUsersPath();
  };

  const roleOptions = (['buyer', 'seller', 'cooperative', 'institution', 'admin'] as const).map(
    (value) => ({ value, label: tRoles(value) }),
  );

  const kycOptions = (['none', 'pending', 'approved', 'rejected'] as const).map((value) => ({
    value,
    label: tKyc(value),
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <h1>{t('title')}</h1>

      <form method="get" className="grid gap-4 md:grid-cols-4">
        <Input
          name="q"
          defaultValue={q}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
        />
        <Select
          name="role"
          defaultValue={role ?? ''}
          placeholder={t('filterRole')}
          options={roleOptions}
          aria-label={t('filterRole')}
        />
        <Select
          name="kycStatus"
          defaultValue={kycStatus ?? ''}
          placeholder={t('filterKycStatus')}
          options={kycOptions}
          aria-label={t('filterKycStatus')}
        />
        <button
          type="submit"
          className="h-[46px] rounded-button border border-border bg-bg px-4 text-[15px] font-semibold text-ink hover:bg-bg-tint"
        >
          {tCommon('applyFilters')}
        </button>
      </form>

      {users.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" strokeWidth={1.75} />}
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        />
      ) : (
        <>
          <DataTable>
            <DataTableHead>
              <DataTableHeaderCell>{t('columns.name')}</DataTableHeaderCell>
              <DataTableHeaderCell>{t('columns.role')}</DataTableHeaderCell>
              <DataTableHeaderCell>{t('columns.kycStatus')}</DataTableHeaderCell>
              <DataTableHeaderCell>{t('columns.memberSince')}</DataTableHeaderCell>
              <DataTableHeaderCell>{t('columns.listings')}</DataTableHeaderCell>
              <DataTableHeaderCell>{t('columns.orders')}</DataTableHeaderCell>
            </DataTableHead>
            <DataTableBody>
              {users.map((user) => (
                <DataTableRow key={user.id}>
                  <DataTableCell>
                    <Link
                      href={adminUsersPath(user.id)}
                      className="font-semibold text-brand-blue hover:text-brand-blue-dark"
                    >
                      {displayName(user.company_name, tCommon('unknownUser'))}
                    </Link>
                  </DataTableCell>
                  <DataTableCell>
                    <Badge variant={roleVariant(user.role)}>{tRoles(user.role)}</Badge>
                  </DataTableCell>
                  <DataTableCell>
                    <Badge variant={kycStatusVariant(user.kyc_status)}>
                      {tKyc(user.kyc_status)}
                    </Badge>
                  </DataTableCell>
                  <DataTableCell>
                    {formatRelativeTime(user.created_at, locale)}
                  </DataTableCell>
                  <DataTableCell className="tabular-nums">{user.listings_count}</DataTableCell>
                  <DataTableCell className="tabular-nums">{user.orders_count}</DataTableCell>
                </DataTableRow>
              ))}
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

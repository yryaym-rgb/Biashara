import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { requireAdminPage } from '@/lib/admin/session';
import { getKycDocumentsForReview, getKycSignedUrl } from '@/lib/admin/queries';
import { safeQuery } from '@/lib/safe-query';
import { adminKycReviewPath } from '@/lib/admin/path';
import { displayName } from '@/lib/admin/display';
import { EmptyState } from '@/components/ui/empty-state';
import { ShieldCheck } from 'lucide-react';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/admin/data-table';
import { KycReviewActions } from '@/components/admin/kyc-review-actions';
import { formatDateTime } from '@/lib/utils/dates';
import { cn } from '@/lib/utils/cn';
import type { Database } from '@/types/database.types';

type KycDocumentStatus = Database['public']['Enums']['kyc_document_status'];

const TABS: KycDocumentStatus[] = ['pending', 'approved', 'rejected'];

export default async function AdminKycReviewPage({
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

  const tab = (typeof sp.tab === 'string' ? sp.tab : 'pending') as KycDocumentStatus;
  const activeTab = TABS.includes(tab) ? tab : 'pending';

  const t = await getTranslations({ locale, namespace: 'admin.kycReview' });
  const tKycDocs = await getTranslations({ locale, namespace: 'kyc' });
  const tCommon = await getTranslations({ locale, namespace: 'admin.common' });

  const documents = await safeQuery(
    'admin/kyc-review',
    () => getKycDocumentsForReview(activeTab),
    [],
  );

  const signedUrls = await Promise.all(
    documents.map(async (doc) => ({
      id: doc.id,
      url: await safeQuery(
        `admin/kyc-review/signed-url/${doc.id}`,
        () => getKycSignedUrl(doc.storage_path),
        null,
      ),
    })),
  );
  const urlById = Object.fromEntries(signedUrls.map((item) => [item.id, item.url]));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <h1>{t('title')}</h1>

      <div className="flex flex-wrap gap-6 border-b border-border">
        {TABS.map((status) => {
          const isActive = activeTab === status;
          const href =
            status === 'pending'
              ? adminKycReviewPath()
              : `${adminKycReviewPath()}?tab=${status}`;

          return (
            <Link
              key={status}
              href={href}
              className={cn(
                'relative pb-3 text-[15px] font-semibold text-body hover:text-ink',
                isActive && 'tab-active',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {t(`tabs.${status}`)}
            </Link>
          );
        })}
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="h-5 w-5" strokeWidth={1.75} />}
          title={t(`empty.${activeTab}.title`)}
          description={t(`empty.${activeTab}.description`)}
        />
      ) : (
        <DataTable>
          <DataTableHead>
            <DataTableHeaderCell>{t('columns.applicant')}</DataTableHeaderCell>
            <DataTableHeaderCell>{t('columns.documentType')}</DataTableHeaderCell>
            <DataTableHeaderCell>{t('columns.submitted')}</DataTableHeaderCell>
            <DataTableHeaderCell>{t('columns.document')}</DataTableHeaderCell>
            {activeTab === 'pending' ? (
              <DataTableHeaderCell>{t('columns.actions')}</DataTableHeaderCell>
            ) : null}
          </DataTableHead>
          <DataTableBody>
            {documents.map((doc) => (
              <DataTableRow key={doc.id}>
                <DataTableCell>
                  {displayName(doc.company_name, tCommon('unknownUser'))}
                </DataTableCell>
                <DataTableCell>{tKycDocs(doc.type)}</DataTableCell>
                <DataTableCell>{formatDateTime(doc.created_at, locale)}</DataTableCell>
                <DataTableCell>
                  {urlById[doc.id] ? (
                    <a
                      href={urlById[doc.id]!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-blue hover:text-brand-blue-dark"
                    >
                      {t('viewDocument')}
                    </a>
                  ) : (
                    tCommon('notAvailable')
                  )}
                </DataTableCell>
                {activeTab === 'pending' ? (
                  <DataTableCell>
                    <KycReviewActions documentId={doc.id} />
                  </DataTableCell>
                ) : null}
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      )}
    </div>
  );
}

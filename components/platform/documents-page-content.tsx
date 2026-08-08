'use client';

import { useTranslations } from 'next-intl';
import { FileText, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { kycStatusVariant } from '@/lib/admin/display';
import type { UserDocumentItem } from '@/lib/platform/documents';
import { formatDateTime } from '@/lib/utils/dates';

export interface DocumentsPageContentProps {
  documents: UserDocumentItem[];
  locale: string;
}

export function DocumentsPageContent({ documents, locale }: DocumentsPageContentProps) {
  const t = useTranslations('platform.documents');
  const tKycTypes = useTranslations('kyc');
  const tKycStatus = useTranslations('admin.kycStatus');
  const tMinerals = useTranslations('minerals');

  const kycDocs = documents.filter((doc) => doc.category === 'kyc');
  const contractDocs = documents.filter((doc) => doc.category === 'contract');

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-5 w-5" strokeWidth={1.75} />}
        title={t('emptyTitle')}
        description={t('emptyDescription')}
      />
    );
  }

  function renderDocumentRow(doc: UserDocumentItem) {
    const title =
      doc.category === 'kyc' && doc.kycType
        ? tKycTypes(doc.kycType)
        : doc.titleParams?.title
          ? t('contractTitle', {
              title: doc.titleParams.title,
              mineral: doc.titleParams.mineral
                ? tMinerals(doc.titleParams.mineral as 'copper')
                : '',
            })
          : t('contractFallback');

    return (
      <li
        key={doc.id}
        className="flex flex-col gap-3 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-ink">{title}</p>
          <p className="mt-1 text-[13px] text-muted">{formatDateTime(doc.createdAt, locale)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {doc.status ? (
            <Badge variant={kycStatusVariant(doc.status)}>{tKycStatus(doc.status)}</Badge>
          ) : null}
          {doc.signedUrl ? (
            <Button asChild variant="secondary" size="sm">
              <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                {t('download')}
              </a>
            </Button>
          ) : (
            <span className="text-[13px] text-muted">{t('unavailable')}</span>
          )}
        </div>
      </li>
    );
  }

  return (
    <div className="space-y-6">
      {kycDocs.length > 0 ? (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[18px]">{t('kycSection')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul>{kycDocs.map(renderDocumentRow)}</ul>
          </CardContent>
        </Card>
      ) : null}

      {contractDocs.length > 0 ? (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[18px]">{t('contractsSection')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul>{contractDocs.map(renderDocumentRow)}</ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

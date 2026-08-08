'use client';

import { useTranslations } from 'next-intl';
import { Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CSV_EXPORTS = ['users', 'listings', 'orders', 'audit-log'] as const;

export function AdminExportCenter() {
  const t = useTranslations('admin.reports.exports');

  function downloadExport(type: (typeof CSV_EXPORTS)[number] | 'report-pdf') {
    const url = `/api/admin/export/${type}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
            {t('csvSection')}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {CSV_EXPORTS.map((type) => (
              <Button
                key={type}
                variant="secondary"
                className="justify-start gap-3"
                onClick={() => downloadExport(type)}
              >
                <Download className="h-4 w-4 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
                {t(`csv.${type}`)}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
            {t('pdfSection')}
          </p>
          <Button
            variant="primary"
            className="gap-3"
            onClick={() => downloadExport('report-pdf')}
          >
            <FileText className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            {t('pdf.report')}
          </Button>
          <p className="mt-2 text-[13px] text-muted">{t('pdf.hint')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

import { NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { getProfile } from '@/lib/auth/session';
import {
  buildTransactionsCsv,
  getUserTransactionsForExport,
} from '@/lib/platform/transaction-export';

export async function GET() {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const locale = profile.locale ?? 'fr';
  const t = await getTranslations({ locale, namespace: 'platform.dashboard.export' });

  try {
    const rows = await getUserTransactionsForExport(profile.id);

    const csv = buildTransactionsCsv(rows, {
      date: t('columns.date'),
      mineral: t('columns.mineral'),
      quantity: t('columns.quantity'),
      price: t('columns.price'),
      total: t('columns.total'),
      counterpart: t('columns.counterpart'),
      status: t('columns.status'),
      reference: t('columns.reference'),
    });

    const filename = `biashara-transactions-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'export_failed' }, { status: 500 });
  }
}

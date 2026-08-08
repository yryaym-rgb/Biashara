import { NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { getProfile } from '@/lib/auth/session';
import { requireRole } from '@/lib/rbac';
import { generatePlatformReportPdf } from '@/lib/admin/generate-platform-report-pdf';
import { getPlatformReportSummary } from '@/lib/admin/reports-queries';
import { formatCurrency, resolveIntlLocale } from '@/lib/utils/format';

export async function GET() {
  const profile = await getProfile();
  try {
    requireRole(profile, ['admin']);
  } catch {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const locale = profile?.locale ?? 'fr';
  const t = await getTranslations({ locale, namespace: 'admin.reports.exports.pdf' });
  const tKyc = await getTranslations({ locale, namespace: 'admin.kycStatus' });
  const tListing = await getTranslations({ locale, namespace: 'admin.listingStatus' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });

  try {
    const summary = await getPlatformReportSummary();
    const generatedTimestamp = new Intl.DateTimeFormat(resolveIntlLocale(locale), {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date());

    const statusLabels: Record<string, string> = {};
    for (const segment of summary.kycFunnel) {
      statusLabels[segment.status] = tKyc(segment.status as 'none');
    }
    for (const segment of summary.listingFunnel) {
      statusLabels[segment.status] = tListing(segment.status as 'draft');
    }

    const mineralLabels: Record<string, string> = {};
    for (const segment of summary.mineralDistribution) {
      mineralLabels[segment.mineral] = tMinerals(segment.mineral);
    }

    const pdfBytes = await generatePlatformReportPdf(
      summary,
      {
        title: t('documentTitle'),
        generatedAt: t('generatedAt'),
        totalUsers: t('totalUsers'),
        totalListings: t('totalListings'),
        totalOrders: t('totalOrders'),
        totalVolume: t('totalVolume'),
        disputeRate: t('disputeRate'),
        kycFunnel: t('kycFunnel'),
        listingFunnel: t('listingFunnel'),
        mineralDistribution: t('mineralDistribution'),
        footer: t('footer'),
        statusLabels,
        mineralLabels,
      },
      formatCurrency(summary.totalVolume, 'USD', locale),
      `${(summary.disputeRate * 100).toFixed(1)}%`,
      generatedTimestamp,
    );

    const filename = `biashara-rapport-plateforme-${new Date().toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch {
    return NextResponse.json({ error: 'export_failed' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { getProfile } from '@/lib/auth/session';
import { requireRole } from '@/lib/rbac';
import { generateExportCsv, type ExportType } from '@/lib/admin/export';

const VALID_TYPES: ExportType[] = ['users', 'listings', 'orders', 'audit-log'];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const profile = await getProfile();
  try {
    requireRole(profile, ['admin']);
  } catch {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { type } = await params;
  if (!VALID_TYPES.includes(type as ExportType)) {
    return NextResponse.json({ error: 'invalid_type' }, { status: 400 });
  }

  const locale = profile?.locale ?? 'fr';
  const t = await getTranslations({ locale, namespace: 'admin.reports.exports.columns' });

  try {
    const headers: Record<string, string> = {};
    if (type === 'users') {
      Object.assign(headers, {
        id: t('id'),
        companyName: t('companyName'),
        role: t('role'),
        country: t('country'),
        phone: t('phone'),
        locale: t('locale'),
        kycStatus: t('kycStatus'),
        createdAt: t('createdAt'),
        updatedAt: t('updatedAt'),
      });
    } else if (type === 'listings') {
      Object.assign(headers, {
        id: t('id'),
        sellerId: t('sellerId'),
        mineral: t('mineral'),
        title: t('title'),
        grade: t('grade'),
        purity: t('purity'),
        quantity: t('quantity'),
        unit: t('unit'),
        priceAmount: t('priceAmount'),
        priceCurrency: t('priceCurrency'),
        priceType: t('priceType'),
        originProvince: t('originProvince'),
        status: t('status'),
        createdAt: t('createdAt'),
        updatedAt: t('updatedAt'),
      });
    } else if (type === 'orders') {
      Object.assign(headers, {
        id: t('id'),
        offerId: t('offerId'),
        listingId: t('listingId'),
        buyerId: t('buyerId'),
        sellerId: t('sellerId'),
        mineral: t('mineral'),
        listingTitle: t('listingTitle'),
        priceAmount: t('priceAmount'),
        quantity: t('quantity'),
        unit: t('unit'),
        currency: t('currency'),
        status: t('status'),
        disputeReason: t('disputeReason'),
        disputedAt: t('disputedAt'),
        createdAt: t('createdAt'),
        updatedAt: t('updatedAt'),
      });
    } else {
      Object.assign(headers, {
        id: t('id'),
        actorId: t('actorId'),
        action: t('action'),
        entity: t('entity'),
        entityId: t('entityId'),
        diff: t('diff'),
        createdAt: t('createdAt'),
      });
    }

    const csv = await generateExportCsv(type as ExportType, headers);
    const filename = `biashara-admin-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch {
    return NextResponse.json({ error: 'export_failed' }, { status: 500 });
  }
}

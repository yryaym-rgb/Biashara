import 'server-only';

import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateOrderSummaryPdf } from '@/lib/contracts/generate-order-summary-pdf';
import { formatOrderReference } from '@/lib/platform/order-status';
import type { PlatformOrderDetail } from '@/lib/platform/orders';
import { formatCurrency, formatPricePerUnit } from '@/lib/utils/format';
import { formatDateTime } from '@/lib/utils/dates';
import type { MineralId } from '@/lib/constants/minerals';

const CONTRACT_FILENAME = 'order-summary.pdf';

export interface OrderContractView {
  id: string;
  storage_path: string;
  buyer_signed: boolean;
  seller_signed: boolean;
  buyer_signed_at: string | null;
  seller_signed_at: string | null;
  pdfUrl: string | null;
}

function contractStoragePath(orderId: string): string {
  return `${orderId}/${CONTRACT_FILENAME}`;
}

export async function ensureOrderContract(
  order: PlatformOrderDetail,
  locale: string,
): Promise<OrderContractView | null> {
  const supabase = await createClient();
  const admin = createAdminClient();
  const storagePath = contractStoragePath(order.id);

  const { data: existing } = await supabase
    .from('contracts')
    .select('id, storage_path, buyer_signed, seller_signed, buyer_signed_at, seller_signed_at')
    .eq('order_id', order.id)
    .maybeSingle();

  if (!existing?.storage_path) {
    const tMinerals = await getTranslations({ locale, namespace: 'minerals' });
    const tUnits = await getTranslations({ locale, namespace: 'units' });
    const mineral = order.listing?.mineral as MineralId | undefined;
    const unitLabel = tUnits(order.unit);
    const totalAmount = order.price_amount * order.quantity;

    const pdfBytes = await generateOrderSummaryPdf({
      orderId: order.id,
      orderDate: formatDateTime(order.created_at, locale),
      mineralLabel: mineral ? tMinerals(mineral) : '—',
      listingTitle: order.listing?.title ?? '—',
      quantity: order.quantity,
      unitLabel,
      priceAmount: order.price_amount,
      currency: order.currency,
      totalAmount,
      buyerCompanyName: order.buyer?.company_name ?? '—',
      sellerCompanyName: order.seller?.company_name ?? '—',
      formattedPricePerUnit: formatPricePerUnit(
        order.price_amount,
        order.currency,
        unitLabel,
        locale,
      ),
      formattedTotal: formatCurrency(totalAmount, order.currency, locale),
    });

    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(storagePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    if (existing) {
      const { data: updated, error: updateError } = await admin
        .from('contracts')
        .update({ storage_path: storagePath })
        .eq('order_id', order.id)
        .select('id, storage_path, buyer_signed, seller_signed, buyer_signed_at, seller_signed_at')
        .single();

      if (updateError || !updated) {
        throw new Error(updateError?.message ?? 'Contract update failed');
      }

      const pdfUrl = await getContractSignedUrl(storagePath);
      return { ...updated, storage_path: storagePath, pdfUrl };
    }

    const { data: inserted, error: insertError } = await admin
      .from('contracts')
      .insert({
        order_id: order.id,
        storage_path: storagePath,
      })
      .select('id, storage_path, buyer_signed, seller_signed, buyer_signed_at, seller_signed_at')
      .single();

    if (insertError || !inserted) {
      throw new Error(insertError?.message ?? 'Contract insert failed');
    }

    const pdfUrl = await getContractSignedUrl(storagePath);
    return { ...inserted, storage_path: storagePath, pdfUrl };
  }

  const pdfUrl = await getContractSignedUrl(existing.storage_path);
  return { ...existing, storage_path: existing.storage_path, pdfUrl };
}

async function getContractSignedUrl(storagePath: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from('contracts')
    .createSignedUrl(storagePath, 3600);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

export function formatContractDownloadName(orderId: string): string {
  return `biashara-commande-${formatOrderReference(orderId).toLowerCase()}.pdf`;
}

import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { getKycSignedUrl } from '@/lib/admin/queries';
import type { Database } from '@/types/database.types';

type KycDocumentType = Database['public']['Enums']['kyc_document_type'];
type KycDocumentStatus = Database['public']['Enums']['kyc_document_status'];

export type DocumentCategory = 'kyc' | 'contract';

export interface UserDocumentItem {
  id: string;
  category: DocumentCategory;
  titleKey: string;
  titleParams?: Record<string, string>;
  status?: KycDocumentStatus;
  kycType?: KycDocumentType;
  createdAt: string;
  signedUrl: string | null;
  orderId?: string;
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

export async function getUserDocuments(userId: string): Promise<UserDocumentItem[]> {
  const supabase = await createClient();

  const [kycRes, ordersRes] = await Promise.all([
    supabase
      .from('kyc_documents')
      .select('id, type, status, storage_path, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('orders')
      .select('id')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`),
  ]);

  if (kycRes.error) {
    throw new Error(kycRes.error.message);
  }
  if (ordersRes.error) {
    throw new Error(ordersRes.error.message);
  }

  const orderIds = (ordersRes.data ?? []).map((o) => o.id);

  let contractsData: Array<{
    id: string;
    order_id: string;
    storage_path: string | null;
    created_at: string;
    order: {
      listing: { title: string; mineral: string } | { title: string; mineral: string }[] | null;
    } | {
      listing: { title: string; mineral: string } | { title: string; mineral: string }[] | null;
    }[] | null;
  }> = [];

  if (orderIds.length > 0) {
    const contractsRes = await supabase
      .from('contracts')
      .select(
        `
          id,
          order_id,
          storage_path,
          created_at,
          order:orders!inner(
            listing:listings(title, mineral)
          )
        `,
      )
      .in('order_id', orderIds)
      .not('storage_path', 'is', null)
      .order('created_at', { ascending: false });

    if (contractsRes.error) {
      throw new Error(contractsRes.error.message);
    }

    contractsData = contractsRes.data ?? [];
  }

  const kycItems: UserDocumentItem[] = await Promise.all(
    (kycRes.data ?? []).map(async (doc) => ({
      id: doc.id,
      category: 'kyc' as const,
      titleKey: 'kycDocument',
      kycType: doc.type,
      status: doc.status,
      createdAt: doc.created_at,
      signedUrl: await getKycSignedUrl(doc.storage_path),
    })),
  );

  const contractItems: UserDocumentItem[] = await Promise.all(
    contractsData.map(async (contract) => {
      const order = Array.isArray(contract.order) ? contract.order[0] : contract.order;
      const listing = order?.listing
        ? Array.isArray(order.listing)
          ? order.listing[0]
          : order.listing
        : null;

      return {
        id: contract.id,
        category: 'contract' as const,
        titleKey: 'contract',
        titleParams: {
          title: listing?.title ?? '',
          mineral: listing?.mineral ?? '',
        },
        createdAt: contract.created_at,
        signedUrl: contract.storage_path
          ? await getContractSignedUrl(contract.storage_path)
          : null,
        orderId: contract.order_id,
      };
    }),
  );

  return [...kycItems, ...contractItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

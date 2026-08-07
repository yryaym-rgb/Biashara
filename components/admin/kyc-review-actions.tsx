'use client';

import { useTransition } from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { approveKycDocument, rejectKycDocument } from '@/actions/admin/kyc';
import { Button } from '@/components/ui/button';
import { RejectDialog } from '@/components/admin/reject-dialog';
import { useState } from 'react';

export interface KycReviewActionsProps {
  documentId: string;
}

export function KycReviewActions({ documentId }: KycReviewActionsProps) {
  const t = useTranslations('admin.kycReview');
  const router = useRouter();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        loading={isPending}
        onClick={() => {
          startTransition(async () => {
            await approveKycDocument({ documentId });
            router.refresh();
          });
        }}
      >
        {t('approve')}
      </Button>
      <Button
        size="sm"
        variant="secondary"
        className="text-danger"
        onClick={() => setRejectOpen(true)}
      >
        {t('reject')}
      </Button>
      <RejectDialog
        open={rejectOpen}
        title={t('rejectDialogTitle')}
        onClose={() => setRejectOpen(false)}
        onConfirm={async (reason) => {
          const result = await rejectKycDocument({ documentId, reason });
          if (!result.error) {
            router.refresh();
          }
          return result;
        }}
      />
    </div>
  );
}

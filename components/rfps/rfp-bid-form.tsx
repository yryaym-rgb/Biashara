'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { submitRfpBid } from '@/actions/rfps';
import { rfpBidCreateSchema } from '@/lib/validators/rfp';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';

export interface RfpBidFormProps {
  rfpId: string;
  maxQuantity: number;
}

export function RfpBidForm({ rfpId, maxQuantity }: RfpBidFormProps) {
  const t = useTranslations('platform.rfps.detail');
  const tValidation = useTranslations('validation');

  const [quantity, setQuantity] = React.useState('');
  const [offeredPrice, setOfferedPrice] = React.useState('');
  const [deliveryTerms, setDeliveryTerms] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSuccess(false);

    const parsed = rfpBidCreateSchema.safeParse({
      rfpId,
      quantity: Number(quantity),
      offeredPrice: Number(offeredPrice),
      deliveryTerms: deliveryTerms.trim() || undefined,
      message: message.trim() || undefined,
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string;
        if (field === 'quantity' || field === 'offeredPrice') {
          errors[field] = tValidation('positiveNumber');
        }
      }
      setFieldErrors(errors);
      return;
    }

    if (parsed.data.quantity > maxQuantity) {
      setFieldErrors({ quantity: tValidation('positiveNumber') });
      return;
    }

    setLoading(true);
    try {
      const result = await submitRfpBid(parsed.data);
      if (result.error) {
        setFormError(t('bidError'));
        return;
      }
      setSuccess(true);
      setQuantity('');
      setOfferedPrice('');
      setDeliveryTerms('');
      setMessage('');
    } catch {
      setFormError(t('bidError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-card border border-border p-6">
      <h3 className="text-[18px] font-semibold text-ink">{t('submitBid')}</h3>

      {success ? (
        <p className="text-[15px] text-success" role="status">
          {t('bidSuccess')}
        </p>
      ) : null}

      {formError ? (
        <p className="text-[13px] text-danger" role="alert">
          {formError}
        </p>
      ) : null}

      <Input
        label={t('bidQuantity')}
        type="number"
        min={0}
        step="any"
        value={quantity}
        onChange={(event) => setQuantity(event.target.value)}
        error={fieldErrors.quantity}
        required
      />

      <Input
        label={t('bidPrice')}
        type="number"
        min={0}
        step="any"
        value={offeredPrice}
        onChange={(event) => setOfferedPrice(event.target.value)}
        error={fieldErrors.offeredPrice}
        required
      />

      <Input
        label={t('bidDeliveryTerms')}
        value={deliveryTerms}
        onChange={(event) => setDeliveryTerms(event.target.value)}
      />

      <Textarea
        label={t('bidMessage')}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={3}
      />

      <Button type="submit" variant="primary" loading={loading}>
        {t('bidSubmit')}
      </Button>
    </form>
  );
}

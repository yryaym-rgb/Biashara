'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { createOffer } from '@/actions/offers';
import { offerCreateSchema } from '@/lib/validators/offer';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';

export interface OfferFormProps {
  listingId: string;
  maxQuantity: number;
}

export function OfferForm({ listingId, maxQuantity }: OfferFormProps) {
  const t = useTranslations('platform.marketplace.detail');
  const tValidation = useTranslations('validation');

  const [quantity, setQuantity] = React.useState('');
  const [offeredPrice, setOfferedPrice] = React.useState('');
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

    const parsed = offerCreateSchema.safeParse({
      listingId,
      quantity: Number(quantity),
      offeredPrice: Number(offeredPrice),
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
      const result = await createOffer(parsed.data);
      if (result.error) {
        setFormError(tValidation('required'));
        return;
      }
      setSuccess(true);
      setQuantity('');
      setOfferedPrice('');
      setMessage('');
    } catch {
      setFormError(tValidation('required'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-card border border-border p-6">
      <h3 className="text-[18px] font-semibold text-ink">{t('makeOffer')}</h3>

      {success ? (
        <p className="text-[15px] text-success" role="status">{t('offerSuccess')}</p>
      ) : null}

      {formError ? (
        <p className="text-[13px] text-danger" role="alert">{formError}</p>
      ) : null}

      <Input
        label={t('offerQuantity')}
        type="number"
        min={0}
        step="any"
        value={quantity}
        onChange={(event) => setQuantity(event.target.value)}
        error={fieldErrors.quantity}
        required
      />

      <Input
        label={t('offerPrice')}
        type="number"
        min={0}
        step="any"
        value={offeredPrice}
        onChange={(event) => setOfferedPrice(event.target.value)}
        error={fieldErrors.offeredPrice}
        required
      />

      <Textarea
        label={t('offerMessage')}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={3}
      />

      <Button type="submit" variant="primary" loading={loading}>
        {t('offerSubmit')}
      </Button>
    </form>
  );
}

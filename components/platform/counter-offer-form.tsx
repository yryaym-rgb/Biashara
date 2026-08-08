'use client';

import * as React from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { acceptOffer, counterOffer, declineOffer } from '@/actions/offers';
import { offerCounterSchema } from '@/lib/validators/offer';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';

export interface CounterOfferFormProps {
  parentOfferId: string;
  onCancel: () => void;
}

export function CounterOfferForm({ parentOfferId, onCancel }: CounterOfferFormProps) {
  const t = useTranslations('platform.offers.counterForm');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const router = useRouter();

  const [quantity, setQuantity] = React.useState('');
  const [offeredPrice, setOfferedPrice] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = offerCounterSchema.safeParse({
      parentOfferId,
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

    setLoading(true);
    try {
      const result = await counterOffer(parsed.data);
      if (result.error) {
        setFormError(tValidation('required'));
        return;
      }
      onCancel();
      router.refresh();
    } catch {
      setFormError(tValidation('required'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col gap-4 rounded-card border border-border bg-bg-tint p-4"
    >
      <Input
        label={t('quantity')}
        type="number"
        min={0}
        step="any"
        value={quantity}
        onChange={(event) => setQuantity(event.target.value)}
        error={fieldErrors.quantity}
        required
      />
      <Input
        label={t('price')}
        type="number"
        min={0}
        step="any"
        value={offeredPrice}
        onChange={(event) => setOfferedPrice(event.target.value)}
        error={fieldErrors.offeredPrice}
        required
      />
      <Textarea
        label={t('message')}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={3}
      />
      {formError ? (
        <p className="text-[13px] text-danger" role="alert">
          {formError}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" size="sm" loading={loading}>
          {t('submit')}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          {tCommon('cancel')}
        </Button>
      </div>
    </form>
  );
}

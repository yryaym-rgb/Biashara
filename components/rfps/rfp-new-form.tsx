'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { createRfp } from '@/actions/rfps';
import { MINERAL_IDS, QUANTITY_UNITS } from '@/lib/constants/minerals';
import { rfpCreateSchema } from '@/lib/validators/rfp';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';

export function RfpNewForm() {
  const t = useTranslations('platform.rfps.new');
  const tMinerals = useTranslations('minerals');
  const tUnits = useTranslations('units');
  const tValidation = useTranslations('validation');
  const router = useRouter();

  const [mineral, setMineral] = React.useState('');
  const [quantity, setQuantity] = React.useState('');
  const [unit, setUnit] = React.useState('');
  const [targetPriceMin, setTargetPriceMin] = React.useState('');
  const [targetPriceMax, setTargetPriceMax] = React.useState('');
  const [deliveryTerms, setDeliveryTerms] = React.useState('');
  const [deadline, setDeadline] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = rfpCreateSchema.safeParse({
      mineral,
      quantity: Number(quantity),
      unit,
      targetPriceMin: targetPriceMin ? Number(targetPriceMin) : undefined,
      targetPriceMax: targetPriceMax ? Number(targetPriceMax) : undefined,
      deliveryTerms: deliveryTerms.trim() || undefined,
      deadline,
      description: description.trim(),
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string;
        if (field === 'quantity' || field === 'targetPriceMin' || field === 'targetPriceMax') {
          errors[field] = tValidation('positiveNumber');
        } else if (field === 'description') {
          errors[field] = tValidation('descriptionMin');
        } else {
          errors[field] = tValidation('required');
        }
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const result = await createRfp(parsed.data);
      if (result.error || !result.data) {
        setFormError(t('submitError'));
        return;
      }
      router.push(`/rfps/${result.data.id}`);
    } catch {
      setFormError(t('submitError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-card border border-border p-6">
      {formError ? (
        <p className="text-[13px] text-danger" role="alert">
          {formError}
        </p>
      ) : null}

      <Select
        label={t('mineral')}
        value={mineral}
        onChange={(event) => setMineral(event.target.value)}
        error={fieldErrors.mineral}
        placeholder={t('mineralPlaceholder')}
        options={MINERAL_IDS.map((id) => ({ value: id, label: tMinerals(id) }))}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
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
        <Select
          label={t('unit')}
          value={unit}
          onChange={(event) => setUnit(event.target.value)}
          error={fieldErrors.unit}
          placeholder={t('unitPlaceholder')}
          options={QUANTITY_UNITS.map((id) => ({ value: id, label: tUnits(id) }))}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('targetPriceMin')}
          type="number"
          min={0}
          step="any"
          value={targetPriceMin}
          onChange={(event) => setTargetPriceMin(event.target.value)}
          error={fieldErrors.targetPriceMin}
        />
        <Input
          label={t('targetPriceMax')}
          type="number"
          min={0}
          step="any"
          value={targetPriceMax}
          onChange={(event) => setTargetPriceMax(event.target.value)}
          error={fieldErrors.targetPriceMax}
        />
      </div>

      <Input
        label={t('deliveryTerms')}
        value={deliveryTerms}
        onChange={(event) => setDeliveryTerms(event.target.value)}
        error={fieldErrors.deliveryTerms}
      />

      <Input
        label={t('deadline')}
        type="date"
        value={deadline}
        onChange={(event) => setDeadline(event.target.value)}
        error={fieldErrors.deadline}
        required
      />

      <Textarea
        label={t('description')}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        error={fieldErrors.description}
        rows={5}
        required
      />

      <Button type="submit" variant="primary" loading={loading}>
        {t('submit')}
      </Button>
    </form>
  );
}

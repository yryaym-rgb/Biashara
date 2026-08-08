'use client';

import * as React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { ArrowDown, ArrowUp, Upload, X } from 'lucide-react';
import { createListingWithPhotos } from '@/actions/listings';
import { MINERAL_IDS, QUANTITY_UNITS } from '@/lib/constants/minerals';
import { DRC_PROVINCES } from '@/lib/constants/provinces';
import { listingCreateSchema } from '@/lib/validators/listing';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PhotoEntry {
  id: string;
  file: File;
  previewUrl: string;
}

import type { UnlinkedLotOption } from '@/lib/platform/lots';

export interface ListingNewFormProps {
  availableLots?: UnlinkedLotOption[];
  showLotSelect?: boolean;
}

export function ListingNewForm({
  availableLots = [],
  showLotSelect = false,
}: ListingNewFormProps) {
  const t = useTranslations('platform.marketplace.new');
  const tMinerals = useTranslations('minerals');
  const tUnits = useTranslations('units');
  const tValidation = useTranslations('validation');
  const router = useRouter();

  const [mineral, setMineral] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [grade, setGrade] = React.useState('');
  const [purity, setPurity] = React.useState('');
  const [quantity, setQuantity] = React.useState('');
  const [unit, setUnit] = React.useState('');
  const [priceType, setPriceType] = React.useState('negotiable');
  const [priceAmount, setPriceAmount] = React.useState('');
  const [originProvince, setOriginProvince] = React.useState('');
  const [certInput, setCertInput] = React.useState('');
  const [certifications, setCertifications] = React.useState<string[]>([]);
  const [lotId, setLotId] = React.useState('');
  const [photos, setPhotos] = React.useState<PhotoEntry[]>([]);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, [photos]);

  function addCertification() {
    const value = certInput.trim();
    if (!value || certifications.includes(value)) return;
    setCertifications((current) => [...current, value]);
    setCertInput('');
  }

  function handleCertKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addCertification();
    }
  }

  function handlePhotoSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) return;

    const newEntries = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPhotos((current) => [...current, ...newEntries]);
    event.target.value = '';
  }

  function removePhoto(id: string) {
    setPhotos((current) => {
      const target = current.find((photo) => photo.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((photo) => photo.id !== id);
    });
  }

  function movePhoto(id: string, direction: 'up' | 'down') {
    setPhotos((current) => {
      const index = current.findIndex((photo) => photo.id === id);
      if (index < 0) return current;
      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const copy = [...current];
      const item = copy[index];
      if (!item) return current;
      copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSuccess(false);

    const input = {
      mineral,
      title,
      description,
      grade: grade.trim() || undefined,
      purity: purity ? Number(purity) : undefined,
      quantity: Number(quantity),
      unit,
      priceType,
      priceAmount: priceAmount ? Number(priceAmount) : undefined,
      priceCurrency: 'USD',
      originProvince,
      certifications,
      lotId: lotId || undefined,
    };

    const parsed = listingCreateSchema.safeParse(input);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0]);
        errors[field] = tValidation(
          field === 'title' ? 'titleMin' :
          field === 'description' ? 'descriptionMin' :
          field === 'mineral' ? 'mineralInvalid' :
          'required',
        );
      }
      setFieldErrors(errors);
      return;
    }

    if (
      parsed.data.priceType !== 'indicative' &&
      (!parsed.data.priceAmount || parsed.data.priceAmount <= 0)
    ) {
      setFieldErrors({ priceAmount: tValidation('required') });
      return;
    }

    const formData = new FormData();
    formData.set('mineral', mineral);
    formData.set('title', title);
    formData.set('description', description);
    if (grade.trim()) formData.set('grade', grade.trim());
    if (purity) formData.set('purity', purity);
    formData.set('quantity', quantity);
    formData.set('unit', unit);
    formData.set('priceType', priceType);
    if (priceAmount) formData.set('priceAmount', priceAmount);
    formData.set('originProvince', originProvince);
    formData.set('certifications', JSON.stringify(certifications));
    if (lotId) formData.set('lotId', lotId);
    photos.forEach((photo) => formData.append('photos', photo.file));

    setLoading(true);
    try {
      const result = await createListingWithPhotos(formData);
      if ('error' in result && result.error) {
        setFormError(tValidation('required'));
        return;
      }
      setSuccess(true);
      router.push('/marketplace');
      router.refresh();
    } catch {
      setFormError(tValidation('required'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {success ? (
        <p className="text-[15px] text-success" role="status">{t('submitSuccess')}</p>
      ) : null}

      <p className="text-[15px] text-body">{t('pendingReviewNote')}</p>

      {formError ? (
        <p className="text-[13px] text-danger" role="alert">{formError}</p>
      ) : null}

      <Select
        label={t('mineral')}
        value={mineral}
        onChange={(event) => setMineral(event.target.value)}
        error={fieldErrors.mineral}
        required
        placeholder={t('mineral')}
        options={MINERAL_IDS.map((id) => ({
          value: id,
          label: tMinerals(id),
        }))}
      />

      {showLotSelect && availableLots.length > 0 ? (
        <Select
          label={t('linkedLot')}
          value={lotId}
          onChange={(event) => setLotId(event.target.value)}
          hint={t('linkedLotHint')}
          placeholder={t('linkedLotPlaceholder')}
          options={[
            { value: '', label: t('linkedLotNone') },
            ...availableLots.map((lot) => ({
              value: lot.id,
              label: `${lot.lot_code} · ${tMinerals(lot.mineral as (typeof MINERAL_IDS)[number])}`,
            })),
          ]}
        />
      ) : null}

      <Input
        label={t('listingTitle')}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={fieldErrors.title}
        required
      />

      <Textarea
        label={t('description')}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        error={fieldErrors.description}
        required
        rows={5}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('grade')}
          value={grade}
          onChange={(event) => setGrade(event.target.value)}
        />
        <Input
          label={t('purity')}
          type="number"
          min={0}
          max={100}
          step="0.01"
          value={purity}
          onChange={(event) => setPurity(event.target.value)}
        />
      </div>

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
          required
          placeholder={t('unit')}
          options={QUANTITY_UNITS.map((value) => ({
            value,
            label: tUnits(value),
          }))}
        />
      </div>

      <Select
        label={t('priceType')}
        value={priceType}
        onChange={(event) => setPriceType(event.target.value)}
        options={[
          { value: 'fixed', label: t('priceTypeFixed') },
          { value: 'negotiable', label: t('priceTypeNegotiable') },
          { value: 'indicative', label: t('priceTypeIndicative') },
        ]}
      />

      {priceType !== 'indicative' ? (
        <Input
          label={t('priceAmount')}
          type="number"
          min={0}
          step="any"
          value={priceAmount}
          onChange={(event) => setPriceAmount(event.target.value)}
          error={fieldErrors.priceAmount}
          required
        />
      ) : null}

      <Select
        label={t('originProvince')}
        value={originProvince}
        onChange={(event) => setOriginProvince(event.target.value)}
        error={fieldErrors.originProvince}
        required
        placeholder={t('originProvince')}
        options={DRC_PROVINCES.map((province) => ({
          value: province,
          label: province,
        }))}
      />

      <div className="flex flex-col gap-2">
        <Input
          label={t('certifications')}
          hint={t('certificationsHint')}
          value={certInput}
          onChange={(event) => setCertInput(event.target.value)}
          onKeyDown={handleCertKeyDown}
        />
        {certifications.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert) => (
              <Badge key={cert} variant="info">
                {cert}
                <button
                  type="button"
                  className="ml-1"
                  onClick={() =>
                    setCertifications((current) => current.filter((item) => item !== cert))
                  }
                  aria-label={t('removePhoto')}
                >
                  <X className="h-3 w-3" strokeWidth={1.75} />
                </button>
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <p className="text-[15px] font-semibold text-ink">{t('photos')}</p>
          <p className="text-[13px] text-muted">{t('photosHint')}</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handlePhotoSelect}
        />

        <Button
          type="button"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          {t('addPhoto')}
        </Button>

        {photos.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="flex items-center gap-3 rounded-card border border-border p-3"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-button">
                  <Image
                    src={photo.previewUrl}
                    alt=""
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <span className="truncate text-[13px] text-muted">{photo.file.name}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => movePhoto(photo.id, 'up')}
                      className="flex h-8 w-8 items-center justify-center rounded-button border border-border disabled:opacity-40"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      disabled={index === photos.length - 1}
                      onClick={() => movePhoto(photo.id, 'down')}
                      className="flex h-8 w-8 items-center justify-center rounded-button border border-border disabled:opacity-40"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-button border border-border"
                      aria-label={t('removePhoto')}
                    >
                      <X className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <Button type="submit" variant="primary" loading={loading}>
        {t('submit')}
      </Button>
    </form>
  );
}

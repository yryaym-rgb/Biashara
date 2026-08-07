'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadRegistrationKycDocument } from '@/actions/kyc';
import type { Database } from '@/types/database.types';

type KycDocumentType = Database['public']['Enums']['kyc_document_type'];

export interface KycDocumentUploadProps {
  userId: string;
  documentType: KycDocumentType;
  label: string;
  disabled?: boolean;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export function KycDocumentUpload({
  userId,
  documentType,
  label,
  disabled = false,
}: KycDocumentUploadProps) {
  const t = useTranslations('auth.register.kyc');
  const tErrors = useTranslations('auth.errors');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [state, setState] = React.useState<UploadState>('idle');
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setState('uploading');
    setProgress(10);
    setError(null);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('type', documentType);
    formData.append('file', file);

    setProgress(50);

    try {
      const result = await uploadRegistrationKycDocument(formData);
      setProgress(100);

      if (result.error) {
        const errorKey =
          result.error === 'invalidFileType'
            ? 'invalidFileType'
            : result.error === 'fileTooLarge'
              ? 'fileTooLarge'
              : 'uploadFailed';
        setError(tErrors(errorKey));
        setState('error');
        return;
      }

      setState('success');
    } catch {
      setError(tErrors('uploadFailed'));
      setState('error');
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-card border border-border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[15px] font-semibold text-ink">{label}</span>
          {fileName ? (
            <span className="text-[13px] text-muted">{fileName}</span>
          ) : (
            <span className="text-[13px] text-muted">{t('acceptedFormats')}</span>
          )}
        </div>
        {state === 'success' ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-success" strokeWidth={1.75} aria-hidden="true" />
        ) : state === 'uploading' ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
        ) : null}
      </div>

      {state === 'uploading' ? (
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-bg-tint"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-brand-gold motion-safe:transition-all motion-safe:duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      {error ? (
        <p className="text-[13px] text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {state !== 'success' ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="sr-only"
            onChange={handleFileChange}
            disabled={disabled || state === 'uploading'}
            aria-label={`${t('upload')} — ${label}`}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full"
            disabled={disabled || state === 'uploading'}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            {state === 'uploading' ? t('uploading') : t('upload')}
          </Button>
        </>
      ) : (
        <p className="text-[13px] text-success">{t('uploadSuccess')}</p>
      )}
    </div>
  );
}

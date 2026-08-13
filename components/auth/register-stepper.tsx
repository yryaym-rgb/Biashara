'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname, Link } from '@/lib/i18n/navigation';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/auth/password-input';
import { KycDocumentUpload } from '@/components/auth/kyc-document-upload';
import { registerAction, clearRegistrationSessionAction } from '@/actions/auth';
import { getRegistrationKycStatus, verifyRegistrationKycComplete } from '@/actions/kyc';
import { registerStep1Schema } from '@/lib/validators/auth';
import {
  parseRegisterStep,
  buildRegisterStepUrl,
  type RegisterStep,
} from '@/lib/auth/register-step';
import { getRequiredKycDocuments } from '@/lib/constants/kyc-requirements';
import type { Locale } from '@/lib/i18n/config';
import type { Database } from '@/types/database.types';
import { cn } from '@/lib/utils/cn';

type UserRole = Database['public']['Enums']['user_role'];
type KycDocumentType = Database['public']['Enums']['kyc_document_type'];

const REGISTRATION_USER_KEY = 'biashara_registration_user_id';
const REGISTRATION_ROLE_KEY = 'biashara_registration_role';

const STEPS: RegisterStep[] = [1, 2, 3];

export interface RegisterStepperProps {
  registrationEmail?: string | null;
}

export function RegisterStepper({ registrationEmail = null }: RegisterStepperProps) {
  const t = useTranslations('auth.register');
  const tKyc = useTranslations('kyc');
  const tErrors = useTranslations('auth.errors');
  const tValidation = useTranslations('validation');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStep = parseRegisterStep(searchParams.get('step'));

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordConfirm, setPasswordConfirm] = React.useState('');
  const [role, setRole] = React.useState<UserRole>('buyer');
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [registeredRole, setRegisteredRole] = React.useState<UserRole>('buyer');
  const [kycComplete, setKycComplete] = React.useState(false);
  const [kycChecking, setKycChecking] = React.useState(false);
  const [step2Error, setStep2Error] = React.useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = React.useState<string | null>(registrationEmail);

  const refreshKycStatus = React.useCallback(async () => {
    setKycChecking(true);
    try {
      const result = await getRegistrationKycStatus();
      if (result.data) {
        setUserId(result.data.userId);
        setRegisteredRole(result.data.role);
        setKycComplete(result.data.complete);
        if (result.data.email) {
          setConfirmedEmail(result.data.email);
        }
        sessionStorage.setItem(REGISTRATION_USER_KEY, result.data.userId);
        sessionStorage.setItem(REGISTRATION_ROLE_KEY, result.data.role);
      }
    } finally {
      setKycChecking(false);
    }
  }, []);

  React.useEffect(() => {
    const storedUserId = sessionStorage.getItem(REGISTRATION_USER_KEY);
    const storedRole = sessionStorage.getItem(REGISTRATION_ROLE_KEY) as UserRole | null;
    if (storedUserId) setUserId(storedUserId);
    if (storedRole) setRegisteredRole(storedRole);
  }, []);

  React.useEffect(() => {
    if (registrationEmail) {
      setConfirmedEmail(registrationEmail);
    }
  }, [registrationEmail]);

  React.useEffect(() => {
    if (currentStep === 2) {
      void refreshKycStatus();
    }
  }, [currentStep, refreshKycStatus]);

  function goToStep(step: RegisterStep) {
    const url = buildRegisterStepUrl(pathname, step, new URLSearchParams(searchParams.toString()));
    router.push(url);
  }

  function mapValidationError(code: string): string {
    switch (code) {
      case 'passwordMismatch':
        return t('passwordMismatch');
      case 'termsRequired':
        return t('termsRequired');
      default:
        return tValidation('required');
    }
  }

  async function handleStep1Submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = registerStep1Schema.safeParse({
      fullName,
      email,
      password,
      passwordConfirm,
      role,
      acceptTerms,
      locale,
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string;
        if (issue.message === 'Invalid email') {
          errors[field] = tValidation('email');
        } else if (field === 'password' && issue.code === 'too_small') {
          errors.password = tValidation('passwordMin');
        } else if (issue.message === 'passwordMismatch' || issue.message === 'termsRequired') {
          errors[field] = mapValidationError(issue.message);
        } else {
          errors[field] = mapValidationError(issue.message);
        }
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const result = await registerAction(parsed.data, locale);
      if (result.error) {
        const errorKey =
          'errorKey' in result && result.errorKey ? result.errorKey : 'unknown';
        setFormError(tErrors(errorKey));
        return;
      }

      const newUserId = result.data?.user?.id;
      if (newUserId) {
        sessionStorage.setItem(REGISTRATION_USER_KEY, newUserId);
        sessionStorage.setItem(REGISTRATION_ROLE_KEY, role);
        setUserId(newUserId);
        setRegisteredRole(role);
        setConfirmedEmail(parsed.data.email);
      }

      goToStep(2);
    } finally {
      setLoading(false);
    }
  }

  async function handleStep2Continue() {
    setStep2Error(null);
    setLoading(true);
    try {
      const result = await verifyRegistrationKycComplete();
      if (result.error === 'kycIncomplete') {
        setStep2Error(t('kyc.incomplete'));
        await refreshKycStatus();
        return;
      }
      if (result.error) {
        setStep2Error(t('kyc.sessionExpired'));
        return;
      }
      goToStep(3);
    } finally {
      setLoading(false);
    }
  }

  const requiredDocs = getRequiredKycDocuments(registeredRole);

  const roleOptions = [
    { value: 'seller', label: t('roles.seller') },
    { value: 'buyer', label: t('roles.buyer') },
    { value: 'cooperative', label: t('roles.cooperative') },
  ];

  const displayEmail = confirmedEmail ?? email;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[34px] font-bold leading-[1.2] text-ink">{t('heading')}</h1>

      <nav aria-label={t('stepperLabel')}>
        <ol className="flex flex-col gap-2 sm:flex-row sm:gap-0">
          {STEPS.map((step, index) => {
            const isActive = currentStep === step;
            const isComplete = currentStep > step;
            return (
              <li
                key={step}
                className={cn(
                  'flex flex-1 items-center gap-2 text-[13px] font-semibold sm:flex-col sm:items-start sm:gap-1',
                  isActive ? 'text-brand-blue' : isComplete ? 'text-ink' : 'text-muted',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px]',
                    isActive
                      ? 'bg-brand-blue text-[color:var(--white)]'
                      : isComplete
                        ? 'bg-success/15 text-success'
                        : 'bg-bg-tint text-muted',
                  )}
                  aria-hidden="true"
                >
                  {step}
                </span>
                <span className={cn(isActive && 'tab-active inline-block pb-1')}>
                  {t(`steps.${step}` as 'steps.1')}
                </span>
                {index < STEPS.length - 1 ? (
                  <span className="hidden flex-1 border-t border-border sm:mx-4 sm:mt-3 sm:block" aria-hidden="true" />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>

      {currentStep === 1 ? (
        <form onSubmit={handleStep1Submit} className="flex flex-col gap-4" noValidate>
          {formError ? (
            <p className="rounded-button border border-danger/20 bg-danger/10 px-4 py-3 text-[13px] text-danger" role="alert">
              {formError}
            </p>
          ) : null}

          <Input
            name="fullName"
            autoComplete="name"
            label={t('fullName')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={fieldErrors.fullName}
            required
            disabled={loading}
          />

          <Input
            type="email"
            name="email"
            autoComplete="email"
            label={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            required
            disabled={loading}
          />

          <PasswordInput
            name="password"
            autoComplete="new-password"
            label={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            showLabel={t('showPassword')}
            hideLabel={t('hidePassword')}
            required
            disabled={loading}
          />

          <PasswordInput
            name="passwordConfirm"
            autoComplete="new-password"
            label={t('passwordConfirm')}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            error={fieldErrors.passwordConfirm}
            showLabel={t('showPassword')}
            hideLabel={t('hidePassword')}
            required
            disabled={loading}
          />

          <Select
            name="role"
            label={t('role')}
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={roleOptions}
            error={fieldErrors.role}
            required
            disabled={loading}
          />

          <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-button py-1">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-button focus-within:outline focus-within:outline-2 focus-within:outline-offset-2">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                disabled={loading}
                aria-invalid={fieldErrors.acceptTerms ? true : undefined}
              />
              <span
                className="flex h-4 w-4 items-center justify-center rounded border border-border bg-bg text-brand-blue"
                aria-hidden="true"
              >
                {acceptTerms ? (
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                    <path d="M10.3 3.3a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4 0l-2.5-2.5a1 1 0 1 1 1.4-1.4L4.6 7.6l4.3-4.3a1 1 0 0 1 1.4 0Z" />
                  </svg>
                ) : null}
              </span>
            </span>
            <span className="text-[13px] leading-snug text-body">
              {t.rich('terms', {
                termsLink: (chunks) => (
                  <Link
                    href="/about"
                    className="inline-flex min-h-10 items-center py-0 font-semibold text-brand-blue hover:text-brand-blue-dark"
                  >
                    {chunks}
                  </Link>
                ),
                privacyLink: (chunks) => (
                  <Link
                    href="/about"
                    className="inline-flex min-h-10 items-center py-0 font-semibold text-brand-blue hover:text-brand-blue-dark"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </span>
          </label>
          {fieldErrors.acceptTerms ? (
            <p className="text-[13px] text-danger" role="alert">
              {fieldErrors.acceptTerms}
            </p>
          ) : null}

          <Button type="submit" className="w-full" loading={loading} disabled={loading}>
            {t('continue')}
          </Button>
        </form>
      ) : null}

      {currentStep === 2 ? (
        <div className="flex flex-col gap-4">
          <p className="text-[15px] text-body">{t('kyc.description')}</p>

          {step2Error ? (
            <p className="rounded-button border border-danger/20 bg-danger/10 px-4 py-3 text-[13px] text-danger" role="alert">
              {step2Error}
            </p>
          ) : null}

          {!userId ? (
            <p className="rounded-button border border-danger/20 bg-danger/10 px-4 py-3 text-[13px] text-danger" role="alert">
              {t('kyc.sessionExpired')}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {requiredDocs.map((docType: KycDocumentType) => (
                <KycDocumentUpload
                  key={docType}
                  userId={userId}
                  documentType={docType}
                  label={tKyc(docType)}
                  onUploadSuccess={() => void refreshKycStatus()}
                />
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="secondary" onClick={() => goToStep(1)}>
              {t('back')}
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => void handleStep2Continue()}
              disabled={!userId || !kycComplete || kycChecking || loading}
              loading={loading}
            >
              {t('continue')}
            </Button>
          </div>
        </div>
      ) : null}

      {currentStep === 3 ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-[18px] font-semibold text-ink">{t('complete.title')}</h2>

            {displayEmail ? (
              <div className="rounded-card border border-border bg-bg-tint p-4">
                <p className="text-[15px] font-semibold leading-relaxed text-ink">
                  {t('complete.emailLead', { email: displayEmail })}
                </p>
              </div>
            ) : (
              <p className="text-[15px] font-semibold text-ink">{t('complete.emailLeadNoEmail')}</p>
            )}

            <p className="text-[13px] text-muted">{t('complete.reviewNote')}</p>
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={() => {
              sessionStorage.removeItem(REGISTRATION_USER_KEY);
              sessionStorage.removeItem(REGISTRATION_ROLE_KEY);
              void clearRegistrationSessionAction();
              router.push('/dashboard');
            }}
          >
            {t('complete.goToDashboard')}
          </Button>

          <p className="text-center text-[15px] text-body">
            {t('hasAccount')}{' '}
            <Link href="/login" className="font-semibold text-brand-blue hover:text-brand-blue-dark">
              {t('login')}
            </Link>
          </p>
        </div>
      ) : null}

      {currentStep === 1 ? (
        <p className="text-center text-[15px] text-body">
          {t('hasAccount')}{' '}
          <Link href="/login" className="font-semibold text-brand-blue hover:text-brand-blue-dark">
            {t('login')}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

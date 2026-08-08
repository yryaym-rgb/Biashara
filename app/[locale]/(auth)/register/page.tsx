import { Suspense } from 'react';
import { redirect } from '@/lib/i18n/navigation';
import { RegisterStepper } from '@/components/auth/register-stepper';
import { Skeleton } from '@/components/ui/skeleton';
import { parseRegisterStep } from '@/lib/auth/register-step';
import {
  getRegistrationContext,
} from '@/lib/auth/registration';
import { getRegistrationUserEmail } from '@/actions/auth';
import { getSubmittedKycDocumentTypesForUser } from '@/actions/kyc';
import { evaluateRegisterStepGate } from '@/lib/auth/register-kyc-gate';

function RegisterStepperFallback() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-[46px] w-full" />
      <Skeleton className="h-[46px] w-full" />
      <Skeleton className="h-[46px] w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  );
}

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { locale } = await params;
  const { step } = await searchParams;
  const requestedStep = parseRegisterStep(step);

  if (requestedStep >= 2) {
    const context = await getRegistrationContext();
    const submittedTypes = context
      ? await getSubmittedKycDocumentTypesForUser(context.userId)
      : [];
    const gate = evaluateRegisterStepGate(requestedStep, context, submittedTypes);

    if (!gate.allowed) {
      const href =
        gate.redirectStep === 2 ? '/register?step=2' : '/register';
      redirect({ href, locale });
    }
  }

  let registrationEmail: string | null = null;
  if (requestedStep === 3) {
    const context = await getRegistrationContext();
    if (context) {
      registrationEmail = await getRegistrationUserEmail(context.userId);
    }
  }

  return (
    <Suspense fallback={<RegisterStepperFallback />}>
      <RegisterStepper registrationEmail={registrationEmail} />
    </Suspense>
  );
}

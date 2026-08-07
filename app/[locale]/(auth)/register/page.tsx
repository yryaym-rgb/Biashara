import { Suspense } from 'react';
import { RegisterStepper } from '@/components/auth/register-stepper';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterStepperFallback />}>
      <RegisterStepper />
    </Suspense>
  );
}

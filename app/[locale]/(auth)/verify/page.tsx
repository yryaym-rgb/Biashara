import { Suspense } from 'react';
import { VerifyContent } from '@/components/auth/verify-content';
import { Skeleton } from '@/components/ui/skeleton';

function VerifyFallback() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-5 w-48" />
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <VerifyContent />
    </Suspense>
  );
}

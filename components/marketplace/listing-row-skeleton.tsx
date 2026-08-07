import { Skeleton } from '@/components/ui/skeleton';

export function ListingRowSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 border-b border-border py-6 last:border-b-0 md:flex-row md:items-center md:gap-6"
      aria-hidden="true"
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <Skeleton className="h-[72px] w-[72px] shrink-0 rounded-button" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-5 w-48 max-w-full" />
          <Skeleton className="h-4 w-32 max-w-full" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
      </div>
      <div className="flex flex-col items-start gap-3 md:items-end">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-9 w-32 rounded-button" />
      </div>
    </div>
  );
}

export function ListingFeedSkeleton() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, index) => (
        <ListingRowSkeleton key={index} />
      ))}
    </div>
  );
}

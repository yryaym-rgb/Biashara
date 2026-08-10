import { Skeleton } from '@/components/ui/skeleton';

export function DirectoryFeedSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-4 border-b border-border py-6 md:flex-row md:items-center">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-72" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-chip" />
              <Skeleton className="h-6 w-24 rounded-chip" />
            </div>
          </div>
          <div className="space-y-3 md:text-right">
            <Skeleton className="h-8 w-16 md:ml-auto" />
            <Skeleton className="h-9 w-32 rounded-button md:ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

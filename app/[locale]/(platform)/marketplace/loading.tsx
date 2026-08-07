import { Container } from '@/components/ui/container';
import { ListingFeedSkeleton } from '@/components/marketplace/listing-row-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function MarketplaceLoading() {
  return (
    <Container className="pb-16 md:pb-24">
      <div className="sticky top-[72px] z-40 border-b border-border bg-bg py-8 md:py-12">
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="mt-3 h-5 w-full max-w-xl" />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-[46px] flex-1 rounded-button" />
          <Skeleton className="h-[46px] w-28 rounded-button" />
        </div>
      </div>
      <div className="pt-6">
        <Skeleton className="h-8 w-full max-w-2xl" />
      </div>
      <div className="pt-6">
        <ListingFeedSkeleton />
      </div>
    </Container>
  );
}

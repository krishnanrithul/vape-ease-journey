import { Skeleton } from '@/components/ui/skeleton';

/**
 * Generic page placeholder shown for the one render before localStorage
 * hydrates, so pages don't flash their empty state at returning users.
 */
export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="min-h-screen bg-background pb-32" aria-busy="true" aria-label="Loading">
      <div className="px-6 pt-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-56 w-full rounded-xl" />
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

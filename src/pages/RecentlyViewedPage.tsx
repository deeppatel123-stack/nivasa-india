import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock3, History, MapPinned, Trash2 } from 'lucide-react';
import { DemoDisclosure } from '@/components/common/DemoDisclosure';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useListings } from '@/features/listings/queries';
import type { Property } from '@/features/listings/types';
import { useRecentlyViewedStore } from '@/store/useRecentlyViewedStore';
import { useToastStore } from '@/store/useToastStore';

export function RecentlyViewedPage() {
  const ids = useRecentlyViewedStore((state) => state.ids);
  const clearRecentlyViewed = useRecentlyViewedStore((state) => state.clear);
  const pushToast = useToastStore((state) => state.push);
  const { data: listings = [], isPending, isError, refetch } = useListings();

  // The store keeps IDs newest-first; map without reordering so the trail stays accurate.
  const properties = useMemo(() => {
    const byId = new Map(listings.map((listing) => [listing.id, listing] as const));
    return ids
      .map((id) => byId.get(id))
      .filter((property): property is Property => Boolean(property));
  }, [ids, listings]);

  const handleClear = () => {
    clearRecentlyViewed();
    pushToast('Recently viewed trail cleared from this browser.', 'info');
  };

  return (
    <PageShell
      title="Recently viewed"
      description="Demo stays you opened, shown in the order you visited them."
      eyebrow="Your activity"
      showDemoNote={false}
      actions={
        properties.length > 0 ? (
          <Button variant="outline" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" aria-hidden />} onClick={handleClear}>
            Clear all
          </Button>
        ) : undefined
      }
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="teal">{properties.length} viewed</Badge>
          <Badge tone="amber">Stored locally</Badge>
        </div>
        <p className="text-xs text-ink-500">Newest first · up to 12 demo stays</p>
      </div>

      {isPending ? (
        <div aria-live="polite">
          <p className="sr-only" role="status">Loading recently viewed demo stays…</p>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : isError ? (
        <EmptyState
          icon={Clock3}
          title="Could not load demo stays"
          description="The local demo listing catalogue could not be read. You can try again without losing your history."
          action={<Button onClick={() => void refetch()}>Try again</Button>}
        />
      ) : ids.length === 0 ? (
        <EmptyState
          icon={History}
          title="No recently viewed stays"
          description="Open any demo listing to start a trail here. The list updates in order, newest first, and stays in this browser."
          action={
            <Link to="/explore" className={buttonClasses('primary', 'md')}>
              Browse demo stays
            </Link>
          }
          secondary={
            <Link to="/map" className={buttonClasses('outline', 'md')}>
              <MapPinned className="h-4 w-4" aria-hidden />
              Explore on the map
            </Link>
          }
        />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Clock3}
          title="Viewed stays are unavailable"
          description="These IDs are no longer present in the demo catalogue. Clear the trail and browse again."
          action={<Button onClick={handleClear}>Clear history</Button>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((property, index) => (
            <div key={property.id} className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
                <Badge tone="neutral">#{index + 1} · {index === 0 ? 'Most recent' : 'Earlier'}</Badge>
                <span className="text-[11px] text-ink-400">Demo listing</span>
              </div>
              <PropertyCard property={property} layout="grid" />
            </div>
          ))}
        </div>
      )}

      <DemoDisclosure className="mt-7" />

      <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-900" role="note">
        This trail is stored in your browser for the prototype, not in an account or on a server. Listings, prices and
        images are illustrative demo data.
      </p>
    </PageShell>
  );
}

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPinned, Trash2 } from 'lucide-react';
import { DemoDisclosure } from '@/components/common/DemoDisclosure';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useListings } from '@/features/listings/queries';
import type { Property } from '@/features/listings/types';
import { useSavedStore } from '@/store/useSavedStore';
import { useToastStore } from '@/store/useToastStore';

export function WishlistPage() {
  const ids = useSavedStore((state) => state.ids);
  const clearSaved = useSavedStore((state) => state.clear);
  const pushToast = useToastStore((state) => state.push);
  const { data: listings = [], isPending, isError, refetch } = useListings();

  // Preserve the order in which the visitor saved each demo stay.
  const properties = useMemo(() => {
    const byId = new Map(listings.map((listing) => [listing.id, listing] as const));
    return ids
      .map((id) => byId.get(id))
      .filter((property): property is Property => Boolean(property));
  }, [ids, listings]);

  const handleClear = () => {
    clearSaved();
    pushToast('Shortlist cleared from this browser.', 'info');
  };

  return (
    <PageShell
      title="Saved stays"
      description="A shortlist of demo listings you marked with a heart."
      eyebrow="Your shortlist"
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
          <Badge tone="teal">{properties.length} saved {properties.length === 1 ? 'stay' : 'stays'}</Badge>
          <Badge tone="amber">Saved locally</Badge>
        </div>
        <p className="text-xs text-ink-500">In the order you saved them · demo data only</p>
      </div>

      {isPending ? (
        <div aria-live="polite">
          <p className="sr-only" role="status">Loading demo stays…</p>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : isError ? (
        <EmptyState
          icon={Heart}
          title="Could not load demo stays"
          description="The local demo listing catalogue could not be read. You can try again without losing your shortlist."
          action={<Button onClick={() => void refetch()}>Try again</Button>}
        />
      ) : ids.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Use the heart on any demo listing to add it here. Your shortlist is kept in this browser, not in an account."
          action={
            <Link to="/explore" className={buttonClasses('primary', 'md')}>
              Browse demo stays
            </Link>
          }
          secondary={
            <Link to="/map" className={buttonClasses('outline', 'md')} >
              <MapPinned className="h-4 w-4" aria-hidden />
              Explore on the map
            </Link>
          }
        />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Saved stays are unavailable"
          description="These shortlisted IDs are no longer present in the demo catalogue. Clear the list and start a new shortlist."
          action={<Button onClick={handleClear}>Clear shortlist</Button>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} layout="grid" />
          ))}
        </div>
      )}

      <DemoDisclosure className="mt-7" />

      <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-900" role="note">
        This shortlist is stored in your browser for the prototype. It is not synced to any account or server, and every
        listing remains illustrative demo data.
      </p>
    </PageShell>
  );
}

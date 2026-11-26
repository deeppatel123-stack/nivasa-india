import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Info, List, MapPin, Search } from 'lucide-react';
import { ActiveFilterChips } from '@/components/discovery/ActiveFilterChips';
import { useListingResults } from '@/components/discovery/useListingResults';
import { useSearchUrlSync } from '@/components/discovery/useSearchUrlSync';
import { PageShell } from '@/components/layout/PageShell';
import { MapView } from '@/components/map/MapView';
import { PropertyCard } from '@/components/property/PropertyCard';
import { LocationSearchBar } from '@/components/search/LocationSearchBar';
import { Button, buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { formatINR } from '@/features/pricing/pricing';
import { cn } from '@/lib/utils';
import { useSearchStore } from '@/store/useSearchStore';

const INDIA_CENTER = { lat: 22.0, lng: 79.0 };

export function MapDiscoveryPage() {
  useSearchUrlSync();
  const [, setSearchParams] = useSearchParams();
  const { results, isLoading, isError, refetch, resolvedLocation, query, radiusKm, hasCoordinates } = useListingResults();
  const resetFilters = useSearchStore((state) => state.resetFilters);
  const [selectedId, setSelectedId] = useState(null);
  const cardRefs = useRef({});

  const handleSelect = useCallback((id) => {
    setSelectedId(id);
    cardRefs.current[id]?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  }, []);

  const center = resolvedLocation?.coordinates || INDIA_CENTER;
  const markers = useMemo(
    () =>
      results.map((result) => ({
        id: result.property.id,
        coordinates: result.property.location.coordinates,
        label: result.property.title,
        priceLabel: formatINR(result.property.prices.rent),
        note: result.property.prices.rent === null ? 'Rent not available' : undefined,
        isActive: result.property.id === selectedId,
      })),
    [results, selectedId],
  );
  const scene = useMemo(
    () => ({
      center,
      radiusKm,
      markers,
      selectedId,
      onSelect: handleSelect,
      showRadius: hasCoordinates,
    }),
    [center, radiusKm, markers, selectedId, handleSelect, hasCoordinates],
  );

  useEffect(() => {
    if (selectedId && !results.some((result) => result.property.id === selectedId)) setSelectedId(null);
  }, [results, selectedId]);

  const onSearched = useCallback(
    (resolved) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (resolved.query) next.set('q', resolved.query);
          else next.delete('q');
          if (resolved.coordinates?.lat !== undefined && resolved.coordinates?.lng !== undefined) {
            next.set('lat', String(resolved.coordinates.lat));
            next.set('lng', String(resolved.coordinates.lng));
          }
          next.set('radius', String(useSearchStore.getState().radiusKm));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const listHref = query.trim()
    ? `/search?q=${encodeURIComponent(query)}&radius=${radiusKm}`
    : `/explore?radius=${radiusKm}`;

  let cards;
  if (isLoading) {
    cards = (
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, index) => <PropertyCardSkeleton key={index} />)}
      </div>
    );
  } else if (!hasCoordinates) {
    cards = (
      <EmptyState
        icon={Search}
        title="Search for a location first"
        description="Enter a city, locality, landmark, or address to see places on the map."
        action={<Link to="/explore" className={buttonClasses('primary', 'md')}>Choose a location</Link>}
      />
    );
  } else if (isError) {
    cards = (
      <EmptyState
        icon={Search}
        title="Could not load places"
        description="Something went wrong while loading results. Please try again."
        action={<Button onClick={() => void refetch()}>Try again</Button>}
      />
    );
  } else if (!results.length) {
    cards = (
      <EmptyState
        icon={MapPin}
        title="No places found nearby"
        description="Try a larger radius, clear filters, or search a different location."
        action={<Button onClick={() => useSearchStore.getState().setRadius(20)}>Expand to 20 km</Button>}
        secondary={<Link to="/owner/add-property" className={buttonClasses('outline', 'md')}>List a property</Link>}
      />
    );
  } else {
    cards = (
      <div className="space-y-4">
        {results.map((result) => (
          <div
            key={result.property.id}
            ref={(node) => {
              cardRefs.current[result.property.id] = node;
            }}
            onClick={() => handleSelect(result.property.id)}
            className={cn('rounded-2xl transition duration-200', result.property.id === selectedId && 'ring-2 ring-saffron-500 ring-offset-2 ring-offset-canvas')}
          >
            <PropertyCard property={result.property} result={result} />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleSelect(result.property.id);
              }}
              aria-pressed={result.property.id === selectedId}
              className={cn(
                'mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition',
                result.property.id === selectedId
                  ? 'bg-saffron-500 text-ink-950'
                  : 'border border-ink-200 bg-white text-ink-700 hover:border-teal-300 hover:text-teal-800',
              )}
            >
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {result.property.id === selectedId ? 'Selected on map' : 'Show on map'}
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <PageShell
      eyebrow="Map discovery"
      title="Explore places on the map"
      description="See places near your selected location. Select a pin or card to view details."
      breadcrumbs={[{ label: 'Map search' }]}
      actions={<Link to={listHref} className={buttonClasses('outline', 'sm')}><List className="h-4 w-4" aria-hidden />List view</Link>}
    >
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-3 shadow-soft lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <LocationSearchBar variant="compact" disableNavigation onSearched={onSearched} />
        </div>
      </div>

      <div className="mb-5"><ActiveFilterChips /></div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)]">
        <section className="order-2 min-w-0 lg:order-1" aria-label="Places on the map">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-ink-600" aria-live="polite">
              {isLoading ? 'Loading places…' : `${results.length} ${results.length === 1 ? 'place' : 'places'}`}
            </p>
            <button type="button" onClick={resetFilters} className="text-[11px] font-semibold text-teal-700 hover:underline">
              Clear filters
            </button>
          </div>
          {cards}
        </section>

        <div className="order-1 min-w-0 lg:order-2">
          <div className="h-[380px] sm:h-[460px] lg:sticky lg:top-24 lg:h-[640px]">
            <MapView scene={scene} className="h-full w-full border border-ink-100" />
          </div>
          <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              {selectedId ? `Selected: ${results.find((result) => result.property.id === selectedId)?.property.title}` : 'Select a pin or card to link them.'}
            </span>
          </p>
        </div>
      </div>
    </PageShell>
  );
}

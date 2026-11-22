import { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Info, List, MapPin, Search } from 'lucide-react';
import { ActiveFilterChips } from '@/components/discovery/ActiveFilterChips';
import { RadiusControl } from '@/components/discovery/RadiusControl';
import { useListingResults } from '@/components/discovery/useListingResults';
import { useSearchUrlSync } from '@/components/discovery/useSearchUrlSync';
import { PageShell } from '@/components/layout/PageShell';
import { MapView } from '@/components/map/MapView';
import { PropertyCard } from '@/components/property/PropertyCard';
import { LocationSearchBar } from '@/components/search/LocationSearchBar';
import { Button, buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { DEMO_PLACES } from '@/features/locations/demoLocations';
import { formatINR } from '@/features/pricing/pricing';
import { cn } from '@/lib/utils';
import { useSearchStore } from '@/store/useSearchStore';
/** Real Bengaluru reference point used until a location is resolved. */
const FALLBACK_CENTER = DEMO_PLACES.find((place) => place.id === 'bengaluru')?.coordinates ?? {
    lat: 12.9716,
    lng: 77.5946,
};
export function MapDiscoveryPage() {
    useSearchUrlSync();
    const [, setSearchParams] = useSearchParams();
    const { results, isLoading, isError, refetch, resolvedLocation, query, radiusKm } = useListingResults();
    const resetFilters = useSearchStore((state) => state.resetFilters);
    const [selectedId, setSelectedId] = useState(null);
    const cardRefs = useRef({});
    const handleSelect = useCallback((id) => {
        setSelectedId(id);
        cardRefs.current[id]?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    }, []);
    // Keep the map focused on the resolved place, or on Bengaluru with no query.
    const center = resolvedLocation?.coordinates ?? FALLBACK_CENTER;
    const markers = useMemo(() => results.map((result) => ({
        id: result.property.id,
        coordinates: result.property.location.coordinates,
        label: result.property.title,
        priceLabel: formatINR(result.property.prices.rent),
        isActive: result.property.id === selectedId,
    })), [results, selectedId]);
    const scene = useMemo(() => ({ center, radiusKm, markers, selectedId, onSelect: handleSelect }), [center, radiusKm, markers, selectedId, handleSelect]);
    useEffect(() => {
        if (selectedId && !results.some((result) => result.property.id === selectedId)) {
            setSelectedId(null);
        }
    }, [results, selectedId]);
    // The compact bar stays on /map, so mirror its resolved location into the URL.
    const onSearched = useCallback((resolved) => {
        setSearchParams((previous) => {
            const next = new URLSearchParams(previous);
            if (resolved.query)
                next.set('q', resolved.query);
            else
                next.delete('q');
            next.set('radius', String(resolved.coordinates ? useSearchStore.getState().radiusKm : 5));
            return next;
        }, { replace: true });
    }, [setSearchParams]);
    const hasQuery = query.trim().length > 0;
    const listHref = hasQuery
        ? `/search?q=${encodeURIComponent(query)}&radius=${radiusKm}`
        : `/explore?radius=${radiusKm}`;
    const selectedTitle = results.find((result) => result.property.id === selectedId)?.property.title;
    let cards;
    if (isLoading) {
        cards = (<div className="space-y-4">
        {Array.from({ length: 4 }, (_, index) => (<PropertyCardSkeleton key={index}/>))}
      </div>);
    }
    else if (isError) {
        cards = (<EmptyState icon={Search} title="The demo catalogue couldn't load" description="Listing data comes from the local demo repository. Please try again." action={<Button onClick={() => void refetch()}>Try again</Button>}/>);
    }
    else if (!results.length) {
        cards = (<EmptyState icon={MapPin} title="No demo pins for these filters" description="Adjust the radius or clear your filters to bring illustrative stays back onto the map." action={<Button onClick={resetFilters}>Clear all filters</Button>}/>);
    }
    else {
        cards = (<div className="space-y-4">
        {results.map((result) => {
                const isSelected = result.property.id === selectedId;
                return (<div key={result.property.id} ref={(node) => {
                        cardRefs.current[result.property.id] = node;
                    }} onClick={() => handleSelect(result.property.id)} className={cn('rounded-2xl transition duration-200', isSelected && 'ring-2 ring-saffron-500 ring-offset-2 ring-offset-canvas')}>
              <PropertyCard property={result.property} result={result}/>
              <button type="button" onClick={(event) => {
                        event.stopPropagation();
                        handleSelect(result.property.id);
                    }} aria-pressed={isSelected} className={cn('mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition', isSelected
                        ? 'bg-saffron-500 text-ink-950'
                        : 'border border-ink-200 bg-white text-ink-700 hover:border-teal-300 hover:text-teal-800')}>
                <MapPin className="h-3.5 w-3.5" aria-hidden/>
                {isSelected ? 'Selected on map' : 'Show on map'}
              </button>
            </div>);
            })}
      </div>);
    }
    return (<PageShell eyebrow="Map discovery" title="Explore demo stays on the map" description="See how illustrative listings cluster around real reference points. Choose a pin to highlight its card, or a card to find its pin." breadcrumbs={[{ label: 'Map search' }]} actions={<Link to={listHref} className={buttonClasses('outline', 'sm')}>
          <List className="h-4 w-4" aria-hidden/>
          List view
        </Link>}>
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-3 shadow-soft lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <LocationSearchBar variant="compact" disableNavigation onSearched={onSearched}/>
        </div>
        <div className="flex shrink-0 items-center gap-2 lg:w-44">
          <RadiusControl label="Map radius in kilometres" className="w-full"/>
        </div>
      </div>

      <div className="mb-5">
        <ActiveFilterChips />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)]">
        <section className="order-2 min-w-0 lg:order-1" aria-label="Stays on the map">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-ink-600" aria-live="polite">
              {isLoading
            ? 'Loading demo stays…'
            : `${results.length} illustrative demo ${results.length === 1 ? 'pin' : 'pins'}`}
            </p>
            <p className="text-[11px] text-ink-400">
              {hasQuery ? `Centred near ${query}` : 'Showing all demo stays'}
            </p>
          </div>
          {cards}
        </section>

        <div className="order-1 min-w-0 lg:order-2">
          <div className="h-[380px] sm:h-[460px] lg:sticky lg:top-24 lg:h-[640px]">
            <MapView scene={scene} className="h-full w-full border border-ink-100"/>
          </div>
          <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden/>
            <span>
              Pins mark illustrative demo listings, not available homes. Place names and the
              search centre use real geographic reference points.{' '}
              <strong className="font-semibold text-ink-700">
                {selectedTitle ? `Selected: ${selectedTitle}` : 'Select a pin or card to link them.'}
              </strong>
            </span>
          </p>
        </div>
      </div>
    </PageShell>);
}

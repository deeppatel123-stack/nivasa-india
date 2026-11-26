import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, List, Map as MapIcon, MapPin, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
import { ActiveFilterChips } from '@/components/discovery/ActiveFilterChips';
import { useListingResults } from '@/components/discovery/useListingResults';
import { useSearchUrlSync } from '@/components/discovery/useSearchUrlSync';
import { PageShell } from '@/components/layout/PageShell';
import { PropertyCard } from '@/components/property/PropertyCard';
import { LocationSearchBar } from '@/components/search/LocationSearchBar';
import { SearchFiltersPanel } from '@/components/search/SearchFiltersPanel';
import { Button, LinkButton, buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { countActiveFilters } from '@/features/search/searchEngine';
import { SORT_LABELS } from '@/features/search/types';
import { cn } from '@/lib/utils';
import { useSearchStore } from '@/store/useSearchStore';

const SORT_OPTIONS = Object.entries(SORT_LABELS).map(([value, label]) => ({ value, label }));

export function SearchResultsPage() {
  useSearchUrlSync();
  const { pathname } = useLocation();
  const { results, meta, isLoading, isError, error, refetch, resolvedLocation, query, radiusKm, hasCoordinates } = useListingResults();
  const filters = useSearchStore((state) => state.filters);
  const sort = useSearchStore((state) => state.sort);
  const setSort = useSearchStore((state) => state.setSort);
  const resetFilters = useSearchStore((state) => state.resetFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState('grid');
  const hasQuery = query.trim().length > 0;
  const activeCount = countActiveFilters({ query, radiusKm, filters, sort });
  const mapHref = hasQuery
    ? `/map?q=${encodeURIComponent(query)}&radius=${radiusKm}`
    : `/map?radius=${radiusKm}`;

  let content;
  if (isLoading) {
    content = (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => <PropertyCardSkeleton key={index} />)}
      </div>
    );
  } else if (!hasCoordinates) {
    content = (
      <EmptyState
        icon={MapPin}
        title="Choose a location to begin"
        description="Enter a city, locality, landmark, or address to find places nearby."
      />
    );
  } else if (isError) {
    content = (
      <EmptyState
        icon={RefreshCw}
        title="Could not load results"
        description={error?.message || 'Something went wrong while loading results. Please try again.'}
        action={<Button onClick={() => void refetch()}>Try again</Button>}
      />
    );
  } else if (!results.length) {
    content = (
      <EmptyState
        icon={Search}
        title="No places found in this area"
        description={`We couldn't find matching places within ${radiusKm} km${hasQuery ? ` of ${query}` : ''}. Try increasing the radius, clearing filters, or searching a nearby locality or landmark. If listings are limited in this area, you may still see demo or incomplete records where clearly labeled.`}
        action={<Button onClick={() => useSearchStore.getState().setRadius(Math.min(20, Math.max(radiusKm, 10)))}>Try wider radius</Button>}
        secondary={<Button variant="outline" onClick={resetFilters}>Clear filters</Button>}
      />
    );
  } else {
    content = (
      <div className={view === 'grid' ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}>
        {results.map((result) => <PropertyCard key={result.property.id} property={result.property} result={result} layout={view} />)}
      </div>
    );
  }

  return (
    <PageShell
      eyebrow={hasQuery ? 'Location search' : 'Explore stays'}
      title={hasQuery ? `Places near ${query}` : 'Explore stays across India'}
      description={hasQuery
        ? `Showing places within ${radiusKm} km of your selected location.`
        : 'Search any location in India to find places nearby.'}
      breadcrumbs={[{ label: pathname === '/search' ? 'Search' : 'Explore' }]}
      actions={<LinkButton to={mapHref} variant="outline" size="sm"><MapIcon className="h-4 w-4" aria-hidden />Map view</LinkButton>}
    >
      <div className="mb-5 rounded-2xl border border-ink-100 bg-white p-3 shadow-soft sm:p-4">
        <LocationSearchBar variant="compact" />
        <div className="mt-3 flex flex-col gap-3 border-t border-ink-100 pt-3 lg:flex-row lg:items-end">
          <div className="w-full sm:w-52">
            <Select aria-label="Sort results" value={sort} options={SORT_OPTIONS} onChange={(event) => setSort(event.target.value)} className="h-10 py-0 text-xs" />
          </div>
          <Button variant="outline" className="lg:hidden" leftIcon={<SlidersHorizontal className="h-4 w-4" aria-hidden />} onClick={() => setFiltersOpen(true)}>
            Filters
            {activeCount > 0 && <span className="rounded-full bg-teal-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{activeCount}</span>}
          </Button>
          <div className="ml-auto inline-flex shrink-0 items-center gap-0.5 rounded-xl border border-ink-200 bg-white p-0.5" role="group" aria-label="Results layout">
            <button type="button" aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => setView('grid')} className={cn('grid h-9 w-9 place-items-center rounded-lg transition', view === 'grid' ? 'bg-ink-900 text-white' : 'text-ink-500 hover:bg-ink-50')}>
              <LayoutGrid className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')} className={cn('grid h-9 w-9 place-items-center rounded-lg transition', view === 'list' ? 'bg-ink-900 text-white' : 'text-ink-500 hover:bg-ink-50')}>
              <List className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-5"><ActiveFilterChips /></div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,250px)_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Search filters">
          <div className="card sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto p-4">
            <SearchFiltersPanel />
          </div>
        </aside>

        <section aria-label="Search results">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2" aria-live="polite">
            <p className="text-xs font-medium text-ink-600">
              {isLoading
                ? 'Loading places…'
                : !hasCoordinates
                  ? 'Choose a location to start'
                  : `${results.length} ${results.length === 1 ? 'place' : 'places'}${hasQuery ? ` within ${radiusKm} km` : ''}`}
            </p>
          </div>
          {content}
        </section>
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Refine your search" description="Adjust filters to find the right place.">
        <SearchFiltersPanel compact />
        <Button fullWidth className="mt-5" onClick={() => setFiltersOpen(false)}>Show {results.length} {results.length === 1 ? 'place' : 'places'}</Button>
      </Modal>
    </PageShell>
  );
}

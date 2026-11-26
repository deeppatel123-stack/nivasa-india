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
        description="Nivasa needs a resolved Indian location before it can search genuine nearby accommodation records. Enter a city, locality, landmark or address above, or use your current position."
      />
    );
  } else if (isError) {
    content = (
      <EmptyState
        icon={RefreshCw}
        title="Could not load genuine records"
        description={error?.message || 'The listing provider or API could not be reached. No sample listings are substituted.'}
        action={<Button onClick={() => void refetch()}>Try again</Button>}
      />
    );
  } else if (!results.length) {
    content = (
      <EmptyState
        icon={Search}
        title={meta?.demoIncluded ? 'No live records found here' : 'No genuine accommodation records found'}
        description={meta?.demoIncluded
          ? `No live OSM accommodation records matched this search within ${radiusKm} km of ${query || 'this location'}. Clearly labeled DEMO DATA may appear for development/testing only; demo listings are not verified properties.`
          : `No matching OpenStreetMap accommodation places were found within ${radiusKm} km of ${query || 'this location'} with the current filters. Widen the radius, clear filters, or submit a genuine property record.`}
        action={<Button onClick={resetFilters}>Clear all filters</Button>}
        secondary={<Link to="/owner/add-property" className={buttonClasses('outline', 'md')}>Submit a property</Link>}
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
      eyebrow={hasQuery ? 'Location search' : 'Browse stays'}
      title={hasQuery ? `Stays near ${query}` : 'Explore stays across India'}
      description={hasQuery
        ? `Accommodation records within ${radiusKm} km of the resolved Indian location. Live records show source attribution; any DEMO DATA is clearly labeled and never shown as verified.`
        : 'Enter any Indian location to discover accommodation records nearby. Live data is attributed; demo data is clearly labeled.'}
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
                ? 'Loading genuine records…'
                : !hasCoordinates
                  ? 'Awaiting a resolved location'
                  : `${results.length} genuine ${results.length === 1 ? 'record' : 'records'}${hasQuery ? ` within ${radiusKm} km` : ''}`}
            </p>
            <p className="text-[11px] text-ink-400">
              {meta?.attribution || 'Place data © OpenStreetMap contributors, ODbL 1.0'}
            </p>
          </div>
          {content}
        </section>
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Refine your search" description="Filters apply only to genuine records returned for this location.">
        <SearchFiltersPanel compact />
        <Button fullWidth className="mt-5" onClick={() => setFiltersOpen(false)}>Show {results.length} {results.length === 1 ? 'record' : 'records'}</Button>
      </Modal>
    </PageShell>
  );
}

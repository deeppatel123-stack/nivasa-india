import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  List,
  Map as MapIcon,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { ActiveFilterChips } from '@/components/discovery/ActiveFilterChips';
import { RadiusControl } from '@/components/discovery/RadiusControl';
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
import { POPULAR_CITIES } from '@/features/locations/demoLocations';
import { countActiveFilters } from '@/features/search/searchEngine';
import { SORT_LABELS, type SortOption } from '@/features/search/types';
import { cn } from '@/lib/utils';
import { useSearchStore } from '@/store/useSearchStore';

const SORT_OPTIONS = Object.entries(SORT_LABELS).map(([value, label]) => ({ value, label }));

export function SearchResultsPage() {
  useSearchUrlSync();

  const { pathname } = useLocation();
  const { results, isLoading, isError, refetch, resolvedLocation, query, radiusKm } =
    useListingResults();

  const filters = useSearchStore((state) => state.filters);
  const sort = useSearchStore((state) => state.sort);
  const setSort = useSearchStore((state) => state.setSort);
  const resetFilters = useSearchStore((state) => state.resetFilters);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const hasQuery = query.trim().length > 0;
  const unresolved = hasQuery && resolvedLocation?.unresolved === true;
  const activeCount = countActiveFilters({ query, radiusKm, filters, sort });
  const mapHref = hasQuery
    ? `/map?q=${encodeURIComponent(query)}&radius=${radiusKm}`
    : `/map?radius=${radiusKm}`;

  let content: ReactNode;
  if (isLoading) {
    content = (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <PropertyCardSkeleton key={index} />
        ))}
      </div>
    );
  } else if (isError) {
    content = (
      <EmptyState
        icon={RefreshCw}
        title="The demo catalogue couldn't load"
        description="Listing data comes from the local demo repository. Please try again."
        action={<Button onClick={() => void refetch()}>Try again</Button>}
      />
    );
  } else if (unresolved) {
    content = (
      <EmptyState
        icon={MapPin}
        title={`We couldn't resolve “${query}”`}
        description="The demo geocoder recognises only a curated index of real Indian places, so an arbitrary address or locality cannot be placed yet. Connect a geocoding provider to search anywhere in India. Try one of these places in the meantime:"
        action={
          <Link to="/explore" className={buttonClasses('primary', 'sm')}>
            Browse all demo stays
          </Link>
        }
        secondary={
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR_CITIES.slice(0, 5).map((place) => (
              <Link
                key={place.id}
                to={`/search?q=${encodeURIComponent(place.name)}&radius=${radiusKm}`}
                className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-teal-300 hover:text-teal-800"
              >
                {place.name}
              </Link>
            ))}
          </div>
        }
      />
    );
  } else if (!results.length) {
    content = (
      <EmptyState
        icon={Search}
        title="No illustrative stays match these filters"
        description={
          hasQuery
            ? `Nothing in the demo catalogue falls within ${radiusKm} km of ${query} with the current filters. Widen the radius or clear a filter to see more.`
            : 'Nothing in the demo catalogue matches the current filters. Clearing them will show every illustrative stay.'
        }
        action={<Button onClick={resetFilters}>Clear all filters</Button>}
        secondary={
          <Link to="/explore" className={buttonClasses('outline', 'sm')}>
            Browse all demo stays
          </Link>
        }
      />
    );
  } else {
    content = (
      <div
        className={
          view === 'grid'
            ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-3'
            : 'space-y-4'
        }
      >
        {results.map((result) => (
          <PropertyCard
            key={result.property.id}
            property={result.property}
            result={result}
            layout={view}
          />
        ))}
      </div>
    );
  }

  return (
    <PageShell
      eyebrow={hasQuery ? 'Location search' : 'Browse stays'}
      title={hasQuery ? `Stays near ${query}` : 'Explore stays across India'}
      description={
        hasQuery
          ? `Illustrative demo listings ${unresolved ? '' : `within ${radiusKm} km of the selected place`}. Distances use real reference coordinates; prices and availability are not real.`
          : 'Browse the full demo catalogue, then narrow it by stay type, budget and amenities.'
      }
      breadcrumbs={[{ label: pathname === '/search' ? 'Search' : 'Explore' }]}
      actions={
        <LinkButton to={mapHref} variant="outline" size="sm">
          <MapIcon className="h-4 w-4" aria-hidden />
          Map view
        </LinkButton>
      }
    >
      <div className="mb-5 rounded-2xl border border-ink-100 bg-white p-3 shadow-soft sm:p-4">
        <LocationSearchBar variant="compact" />
        <div className="mt-3 flex flex-col gap-3 border-t border-ink-100 pt-3 lg:flex-row lg:items-end">
          <RadiusControl label="Radius in kilometres" className="lg:w-44" />
          <div className="w-full sm:w-52">
            <Select
              aria-label="Sort results"
              value={sort}
              options={SORT_OPTIONS}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="h-10 py-0 text-xs"
            />
          </div>
          <Button
            variant="outline"
            className="lg:hidden"
            leftIcon={<SlidersHorizontal className="h-4 w-4" aria-hidden />}
            onClick={() => setFiltersOpen(true)}
          >
            Filters
            {activeCount > 0 && (
              <span className="rounded-full bg-teal-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </Button>
          <div
            className="ml-auto inline-flex shrink-0 items-center gap-0.5 rounded-xl border border-ink-200 bg-white p-0.5"
            role="group"
            aria-label="Results layout"
          >
            <button
              type="button"
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
              className={cn(
                'grid h-9 w-9 place-items-center rounded-lg transition',
                view === 'grid' ? 'bg-ink-900 text-white' : 'text-ink-500 hover:bg-ink-50',
              )}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="List view"
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
              className={cn(
                'grid h-9 w-9 place-items-center rounded-lg transition',
                view === 'list' ? 'bg-ink-900 text-white' : 'text-ink-500 hover:bg-ink-50',
              )}
            >
              <List className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <ActiveFilterChips />
      </div>

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
                ? 'Loading demo stays…'
                : unresolved
                  ? 'Location could not be resolved'
                  : `${results.length} illustrative demo ${results.length === 1 ? 'stay' : 'stays'}${
                      hasQuery ? ` within ${radiusKm} km of ${query}` : ''
                    }`}
            </p>
            <p className="text-[11px] text-ink-400">Demo data only — no real availability.</p>
          </div>
          {content}
        </section>
      </div>

      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Refine your search"
        description="Filters apply to illustrative demo listings only."
        footer={
          <Button fullWidth onClick={() => setFiltersOpen(false)}>
            Show {results.length} {results.length === 1 ? 'stay' : 'stays'}
          </Button>
        }
      >
        <SearchFiltersPanel compact />
      </Modal>
    </PageShell>
  );
}

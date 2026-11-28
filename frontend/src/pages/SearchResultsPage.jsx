import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, Building2, FlaskConical, Home, LayoutGrid, List, Map as MapIcon, MapPin, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
import { ActiveFilterChips } from '@/components/discovery/ActiveFilterChips';
import { useListingResults } from '@/components/discovery/useListingResults';
import { useSearchUrlSync } from '@/components/discovery/useSearchUrlSync';
import { PageShell } from '@/components/layout/PageShell';
import { PropertyCard } from '@/components/property/PropertyCard';
import { LocationSearchBar } from '@/components/search/LocationSearchBar';
import { SearchFiltersPanel } from '@/components/search/SearchFiltersPanel';
import { Badge } from '@/components/ui/Badge';
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

function ResultSection({ title, description, icon: Icon, items, view, tone = 'default', badge }) {
  if (!items.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3">
        <div className="flex items-start gap-3">
          <span className={cn('mt-0.5 grid h-9 w-9 place-items-center rounded-xl', tone === 'demo' ? 'bg-amber-100 text-amber-700' : tone === 'business' ? 'bg-sky-100 text-sky-700' : 'bg-teal-100 text-teal-700')}>
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
              <Badge tone={tone === 'demo' ? 'warning' : tone === 'business' ? 'info' : 'success'}>{items.length}</Badge>
              {badge}
            </div>
            <p className="mt-0.5 text-xs text-ink-500">{description}</p>
          </div>
        </div>
      </div>
      <div className={cn(view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-4')}>
        {items.map((result) => <PropertyCard key={result.property.id} property={result.property} layout={view === 'list' ? 'list' : 'grid'} />)}
      </div>
    </section>
  );
}

function DiagnosticsPanel({ meta }) {
  const diagnostics = meta?.diagnostics;
  if (!diagnostics) return null;
  const providers = diagnostics.providers || [];
  return (
    <details className="card p-4 text-xs text-ink-600">
      <summary className="cursor-pointer font-semibold text-ink-800">Technical diagnostics (admin)</summary>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div><span className="font-medium text-ink-700">Location:</span> {diagnostics.selectedLocation || '—'}</div>
        <div><span className="font-medium text-ink-700">Coordinates:</span> {diagnostics.coordinates ? `${diagnostics.coordinates.lat.toFixed(5)}, ${diagnostics.coordinates.lng.toFixed(5)}` : '—'}</div>
        <div><span className="font-medium text-ink-700">Country validation:</span> {diagnostics.countryValidation || '—'}</div>
        <div><span className="font-medium text-ink-700">Radius:</span> {diagnostics.radiusKm ?? '—'} km</div>
        <div><span className="font-medium text-ink-700">Raw/valid/filtered:</span> {diagnostics.rawResultCount ?? 0}/{diagnostics.validResultCount ?? 0}/{diagnostics.filteredResultCount ?? 0}</div>
        <div><span className="font-medium text-ink-700">Counts:</span> rental {diagnostics.counts?.rentalListings ?? 0}, business {diagnostics.counts?.accommodationBusinesses ?? 0}, demo {diagnostics.counts?.demoListings ?? 0}</div>
      </div>
      {providers.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="font-medium text-ink-700">Providers</p>
          {providers.map((p, i) => (
            <div key={`${p.provider}-${i}`} className="flex flex-wrap gap-x-3 gap-y-1 rounded-lg bg-ink-50 px-2 py-1">
              <span className="font-medium">{p.provider}</span>
              <span>status: {p.status}</span>
              {p.rawCount != null && <span>raw: {p.rawCount}</span>}
              {p.validCount != null && <span>valid: {p.validCount}</span>}
              {p.error && <span className="text-red-600">error: {p.error}</span>}
              {p.note && <span className="text-ink-500">{p.note}</span>}
            </div>
          ))}
        </div>
      )}
    </details>
  );
}

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
  const hasQuery = String(query || '').trim().length > 0;
  const activeCount = countActiveFilters({ query, radiusKm, filters, sort });
  const mapHref = hasQuery
    ? `/map?q=${encodeURIComponent(query)}&radius=${radiusKm}`
    : `/map?radius=${radiusKm}`;

  const grouped = useMemo(() => ({
    rentals: results.filter((r) => r.property.recordType === 'rental_listing' && !r.property.isDemo),
    businesses: results.filter((r) => r.property.recordType === 'accommodation_business' && !r.property.isDemo),
    demos: results.filter((r) => r.property.isDemo),
  }), [results]);

  const reason = meta?.reason;
  let content;
  if (isLoading) {
    content = <div className={cn(view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-4')}>{Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} layout={view === 'list' ? 'list' : 'grid'} />)}</div>;
  } else if (!hasCoordinates) {
    content = <div className="card p-5"><EmptyState icon={MapPin} title="Search by location" description="Enter a city, area, landmark, college, company, or address in India to find nearby accommodation. Select a suggestion to start your search." /></div>;
  } else if (isError) {
    const unavailable = /unavailable|temporarily/i.test(error?.message || '');
    content = <div className="card p-5"><EmptyState icon={unavailable ? AlertCircle : RefreshCw} title={unavailable ? 'Accommodation search is temporarily unavailable' : "Couldn't load places"} description={unavailable ? 'Please try again in a moment. If the problem continues, try a different location or expand your search radius.' : 'There was a problem loading results. Please check your connection and try again.'} actions={<Button onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" aria-hidden />}>Try again</Button>} /></div>;
  } else if (!results.length) {
    const title = reason === 'providers_unavailable' || reason === 'quota_exceeded' || reason === 'invalid_response'
      ? 'Accommodation search is temporarily unavailable'
      : reason === 'missing_credentials'
        ? 'Accommodation search is partially unavailable'
        : reason === 'outside_india'
          ? 'Location outside supported area'
          : hasQuery ? `No accommodation found near ${query}` : 'No accommodation found nearby';
    const description = reason === 'outside_india'
      ? 'Nivasa currently supports locations within India only. Please search for an Indian city, locality, landmark, college, or address.'
      : reason === 'providers_unavailable' || reason === 'quota_exceeded' || reason === 'invalid_response'
        ? 'We could not complete the accommodation search right now. Please try again, or expand your search radius later.'
        : reason === 'missing_credentials'
          ? 'Some accommodation sources are not configured. You can try again later or search a different location.'
          : `No rental properties or nearby accommodation businesses were found within ${radiusKm} km${hasQuery ? ` of ${query}` : ''}. Try expanding your search radius, clearing filters, or searching a nearby locality or landmark.`;
    content = <div className="space-y-4"><div className="card p-5"><EmptyState icon={reason === 'no_accommodation_found' ? Search : AlertCircle} title={title} description={description} actions={<div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" aria-hidden />}>Retry</Button><Button variant="outline" size="sm" onClick={resetFilters}>Clear filters</Button></div>} /></div><DiagnosticsPanel meta={meta} /></div>;
  } else {
    content = (
      <div className="space-y-8">
        {reason === 'no_rental_listings' && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><p className="font-semibold">No rental listings with pricing evidence found nearby.</p><p className="mt-1 text-amber-800">Nearby accommodation businesses are shown below. These are place/business records and may not have rent, availability, or direct rental contact information.</p></div>}
        <ResultSection title="Rental Properties" description="Listings with rental evidence or owner/submission data. Missing fields are shown as Not available." icon={Home} items={grouped.rentals} view={view} tone="rental" />
        <ResultSection title="Nearby PGs & Hostels" description="Accommodation businesses found from authorized map/place sources. These are not verified rental listings unless rental evidence exists." icon={Building2} items={grouped.businesses} view={view} tone="business" badge={<Badge tone="neutral">Price may be unavailable</Badge>} />
        <ResultSection title="Demo Listings" description="Development/testing-only records. Clearly labeled DEMO DATA and never represented as verified real rentals." icon={FlaskConical} items={grouped.demos} view={view} tone="demo" badge={<Badge tone="warning">DEMO DATA</Badge>} />
        <DiagnosticsPanel meta={meta} />
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

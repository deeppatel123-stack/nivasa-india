import { useMemo } from 'react';
import { useSearchListings } from '@/features/listings/queries';
import { searchListings } from '@/features/search/searchEngine';
import { useSearchStore } from '@/store/useSearchStore';

/** Shared genuine-data search pipeline for the results grid and the map view. */
export function useListingResults() {
  const query = useSearchStore((state) => state.query);
  const radiusKm = useSearchStore((state) => state.radiusKm);
  const filters = useSearchStore((state) => state.filters);
  const sort = useSearchStore((state) => state.sort);
  const resolvedLocation = useSearchStore((state) => state.resolvedLocation);
  const coordinates = resolvedLocation?.coordinates || null;
  const hasCoordinates = Number.isFinite(coordinates?.lat) && Number.isFinite(coordinates?.lng);

  const params = useMemo(
    () => ({
      lat: hasCoordinates ? coordinates.lat : undefined,
      lng: hasCoordinates ? coordinates.lng : undefined,
      radiusKm,
      // `query` is the location text, not a record keyword; coordinates define the search area.
      category: filters.categories.length === 1 ? filters.categories[0] : undefined,
      minRent: filters.minRent ?? undefined,
      maxRent: filters.maxRent ?? undefined,
      amenities: filters.amenities.length ? filters.amenities : undefined,
      sort,
    }),
    [hasCoordinates, coordinates?.lat, coordinates?.lng, radiusKm, query, filters, sort],
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useSearchListings(params, hasCoordinates);
  const listings = data?.items || [];
  const origin = hasCoordinates ? coordinates : null;

  const results = useMemo(
    () => (listings.length ? searchListings(listings, { query, radiusKm, filters, sort }, origin) : []),
    [listings, query, radiusKm, filters, sort, origin?.lat, origin?.lng],
  );

  const demoCount = results.filter((item) => item.property.isDemo).length;
  const rentalCount = results.filter((item) => item.property.recordType === 'rental_listing' && !item.property.isDemo).length;
  const businessCount = results.filter((item) => item.property.recordType === 'accommodation_business' && !item.property.isDemo).length;

  return {
    listings,
    results,
    meta: data?.meta ? { ...data.meta, demoCount, rentalCount, businessCount } : { demoCount, rentalCount, businessCount },
    diagnostics: data?.meta?.diagnostics || null,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    resolvedLocation,
    query,
    radiusKm,
    hasCoordinates,
  };
}

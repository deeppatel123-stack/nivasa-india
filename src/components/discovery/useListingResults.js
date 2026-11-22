import { useMemo } from 'react';
import { useListings } from '@/features/listings/queries';
import { searchListings } from '@/features/search/searchEngine';
import { useSearchStore } from '@/store/useSearchStore';
/** Shared search pipeline for the results grid and the map view. */
export function useListingResults() {
    const { data: listings, isLoading, isError, refetch } = useListings();
    const query = useSearchStore((state) => state.query);
    const radiusKm = useSearchStore((state) => state.radiusKm);
    const filters = useSearchStore((state) => state.filters);
    const sort = useSearchStore((state) => state.sort);
    const resolvedLocation = useSearchStore((state) => state.resolvedLocation);
    const results = useMemo(() => listings
        ? searchListings(listings, { query, radiusKm, filters, sort }, resolvedLocation?.coordinates ?? null)
        : [], [listings, query, radiusKm, filters, sort, resolvedLocation]);
    return {
        listings: listings ?? [],
        results,
        isLoading,
        isError,
        refetch,
        resolvedLocation,
        query,
        radiusKm,
    };
}

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listCachedListings, subscribeToCache } from './listingCache';
import { listingRepository } from './repository';

export const listingKeys = {
  all: ['listings'],
  search: (params) => ['listings', 'search', params],
  detail: (id) => ['listings', 'detail', id],
  submissions: ['listings', 'submissions'],
};

/** Records discovered in this browser session; never fabricated demo data. */
export function useListings() {
  const [items, setItems] = useState(() => listCachedListings());
  useEffect(() => subscribeToCache(() => setItems(listCachedListings())), []);
  return { data: items, isPending: false, isLoading: false, isError: false };
}

export function useSearchListings(params, enabled = true) {
  return useQuery({
    queryKey: listingKeys.search(params),
    queryFn: ({ signal }) => listingRepository.search(params, signal),
    enabled,
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useListing(id) {
  return useQuery({
    queryKey: listingKeys.detail(id ?? 'none'),
    queryFn: ({ signal }) => (id ? listingRepository.getById(id, signal) : null),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useSubmissions() {
  return useQuery({
    queryKey: listingKeys.submissions,
    queryFn: ({ signal }) => listingRepository.mySubmissions(signal),
    retry: false,
  });
}

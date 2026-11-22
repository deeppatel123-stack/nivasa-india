import { useQuery } from '@tanstack/react-query';
import { demoListingRepository } from './repository';
import type { Property } from './types';

export const listingKeys = {
  all: ['listings'] as const,
  detail: (id: string) => ['listings', id] as const,
};

export function useListings() {
  return useQuery<Property[]>({
    queryKey: listingKeys.all,
    queryFn: () => demoListingRepository.list(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useListing(id: string | undefined) {
  return useQuery<Property | null>({
    queryKey: listingKeys.detail(id ?? 'none'),
    queryFn: () => (id ? demoListingRepository.getById(id) : null),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

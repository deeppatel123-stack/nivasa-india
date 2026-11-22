import { useQuery } from '@tanstack/react-query';
import { listingRepository } from './repository';

export const listingKeys = {
  all: ['listings'],
  detail: (id) => ['listings', id],
};

export function useListings() {
  return useQuery({
    queryKey: listingKeys.all,
    queryFn: () => listingRepository.list(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useListing(id) {
  return useQuery({
    queryKey: listingKeys.detail(id ?? 'none'),
    queryFn: () => (id ? listingRepository.getById(id) : null),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

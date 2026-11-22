import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ResolvedLocation } from '@/features/locations/types';
import type { RadiusKm, SearchFilters, SearchState, SortOption } from '@/features/search/types';

interface SearchStore extends SearchState {
  resolvedLocation: ResolvedLocation | null;
  setQuery: (query: string) => void;
  setResolvedLocation: (location: ResolvedLocation | null) => void;
  setRadius: (radiusKm: RadiusKm) => void;
  setSort: (sort: SortOption) => void;
  patchFilters: (patch: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  reset: () => void;
}

const initial = {
  query: '',
  radiusKm: 5,
  filters: {
    categories: [],
    minRent: null,
    maxRent: null,
    furnishing: [],
    gender: [],
    occupancy: [],
    amenities: [],
    availableFrom: null,
    verifiedOnly: false,
  } satisfies SearchFilters,
  sort: 'recommended' as SortOption,
  resolvedLocation: null,
};

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      ...initial,
      setQuery: (query) => set({ query }),
      setResolvedLocation: (resolvedLocation) => set({ resolvedLocation }),
      setRadius: (radiusKm) => set({ radiusKm }),
      setSort: (sort) => set({ sort }),
      patchFilters: (patch) => set((state) => ({ filters: { ...state.filters, ...patch } })),
      resetFilters: () => set({ filters: initial.filters }),
      reset: () => set(initial),
    }),
    { name: 'nivasa.search' },
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
    },
    sort: 'recommended',
    resolvedLocation: null,
};
export const useSearchStore = create()(persist((set) => ({
    ...initial,
    setQuery: (query) => set({ query }),
    setResolvedLocation: (resolvedLocation) => set({ resolvedLocation }),
    setRadius: (radiusKm) => set({ radiusKm }),
    setSort: (sort) => set({ sort }),
    patchFilters: (patch) => set((state) => ({ filters: { ...state.filters, ...patch } })),
    resetFilters: () => set({ filters: initial.filters }),
    reset: () => set(initial),
}), { name: 'nivasa.search' }));

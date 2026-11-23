import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const RADII = new Set([0.5, 1, 2, 5, 10, 20, 50]);
const SORTS = new Set(['recommended', 'distance', 'price_low', 'price_high', 'updated']);
const array = (value) => (Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []);
const nullableNumber = (value) => (Number.isFinite(Number(value)) && value !== null && value !== '' ? Number(value) : null);

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

/** Reject corrupted or stale persisted state instead of trusting localStorage. */
function mergePersisted(persisted, current) {
  const saved = persisted && typeof persisted === 'object' ? persisted : {};
  const filters = saved.filters && typeof saved.filters === 'object' ? saved.filters : {};
  const location =
    saved.resolvedLocation && typeof saved.resolvedLocation === 'object' ? saved.resolvedLocation : null;
  const coordinates = location?.coordinates;
  const validLocation =
    location && Number.isFinite(coordinates?.lat) && Number.isFinite(coordinates?.lng) ? location : null;

  return {
    ...current,
    query: typeof saved.query === 'string' ? saved.query : '',
    radiusKm: RADII.has(Number(saved.radiusKm)) ? Number(saved.radiusKm) : 5,
    sort: SORTS.has(saved.sort) ? saved.sort : 'recommended',
    resolvedLocation: validLocation,
    filters: {
      categories: array(filters.categories),
      minRent: nullableNumber(filters.minRent),
      maxRent: nullableNumber(filters.maxRent),
      furnishing: array(filters.furnishing),
      gender: array(filters.gender),
      occupancy: array(filters.occupancy),
      amenities: array(filters.amenities),
      availableFrom: typeof filters.availableFrom === 'string' ? filters.availableFrom : null,
      verifiedOnly: filters.verifiedOnly === true,
    },
  };
}

export const useSearchStore = create()(persist((set) => ({
  ...initial,
  setQuery: (query) => set({ query: typeof query === 'string' ? query : '' }),
  setResolvedLocation: (resolvedLocation) => set({ resolvedLocation }),
  setRadius: (radiusKm) => set({ radiusKm: RADII.has(Number(radiusKm)) ? Number(radiusKm) : 5 }),
  setSort: (sort) => set({ sort: SORTS.has(sort) ? sort : 'recommended' }),
  patchFilters: (patch) => set((state) => ({ filters: { ...state.filters, ...patch } })),
  resetFilters: () => set({ filters: { ...initial.filters } }),
  reset: () => set({ ...initial, filters: { ...initial.filters } }),
}), { name: 'nivasa.search', merge: mergePersisted, version: 2 }));

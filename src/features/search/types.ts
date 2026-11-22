import type { Furnishing, GenderPreference, Occupancy, PropertyCategory } from '@/features/listings/types';

export type RadiusKm = 1 | 2 | 5 | 10 | 20 | number;
export type SortOption = 'recommended' | 'distance' | 'price_low' | 'price_high' | 'updated';

export interface SearchFilters {
  categories: PropertyCategory[];
  minRent: number | null;
  maxRent: number | null;
  furnishing: Furnishing[];
  gender: GenderPreference[];
  occupancy: Occupancy[];
  amenities: string[];
  availableFrom: string | null;
  verifiedOnly: boolean;
}

export interface SearchState {
  query: string;
  radiusKm: RadiusKm;
  filters: SearchFilters;
  sort: SortOption;
}

export const EMPTY_FILTERS: SearchFilters = {
  categories: [],
  minRent: null,
  maxRent: null,
  furnishing: [],
  gender: [],
  occupancy: [],
  amenities: [],
  availableFrom: null,
  verifiedOnly: false,
};

export const DEFAULT_SEARCH_STATE: SearchState = {
  query: '',
  radiusKm: 5,
  filters: EMPTY_FILTERS,
  sort: 'recommended',
};

export const SORT_LABELS: Record<SortOption, string> = {
  recommended: 'Recommended',
  distance: 'Distance: nearest first',
  price_low: 'Price: low to high',
  price_high: 'Price: high to low',
  updated: 'Recently updated',
};

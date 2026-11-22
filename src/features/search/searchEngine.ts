import { haversineKm } from '@/features/locations/distance';
import type { Coordinates, Property } from '@/features/listings/types';
import { calculateEffectiveCost } from '@/features/pricing/pricing';
import type { SearchState, SortOption } from './types';

export interface SearchResult {
  property: Property;
  distanceKm: number | null;
  monthlyExpense: number;
  perPersonMonthly: number;
  firstMonthOutflow: number;
  score: number;
}

function matchesFilters(property: Property, state: SearchState): boolean {
  const { filters } = state;
  if (filters.categories.length && !filters.categories.includes(property.category)) return false;
  if (filters.furnishing.length && !filters.furnishing.includes(property.furnishing)) return false;
  if (filters.gender.length && !filters.gender.includes(property.genderPreference)) return false;
  if (filters.occupancy.length && !filters.occupancy.includes(property.occupancy)) return false;
  if (filters.amenities.length && !filters.amenities.every((amenity) => property.amenities.includes(amenity as Property['amenities'][number]))) return false;
  if (filters.minRent !== null && property.prices.rent < filters.minRent) return false;
  if (filters.maxRent !== null && property.prices.rent > filters.maxRent) return false;
  if (filters.verifiedOnly && property.verification !== 'verified') return false;
  if (filters.availableFrom && (!property.availableFrom || property.availableFrom > filters.availableFrom)) return false;
  return true;
}

function sortResults(results: SearchResult[], sort: SortOption): SearchResult[] {
  const copy = [...results];
  switch (sort) {
    case 'distance':
      return copy.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    case 'price_low':
      return copy.sort((a, b) => a.monthlyExpense - b.monthlyExpense);
    case 'price_high':
      return copy.sort((a, b) => b.monthlyExpense - a.monthlyExpense);
    case 'updated':
      return copy.sort((a, b) => (b.property.lastUpdated ?? '').localeCompare(a.property.lastUpdated ?? ''));
    default:
      return copy.sort((a, b) => b.score - a.score);
  }
}

export function searchListings(
  listings: Property[],
  state: SearchState,
  origin: Coordinates | null,
): SearchResult[] {
  const results: SearchResult[] = [];
  for (const property of listings) {
    if (!matchesFilters(property, state)) continue;
    const distanceKm = origin ? haversineKm(origin, property.location.coordinates) : null;
    if (origin && distanceKm !== null && distanceKm > state.radiusKm) continue;
    const cost = calculateEffectiveCost(property.prices, property.occupancy);
    const proximityScore = distanceKm === null ? 50 : Math.max(0, 100 - distanceKm * 12);
    const valueScore = Math.max(0, 100 - cost.monthlyExpense / 250);
    const score = proximityScore * 0.55 + valueScore * 0.3 + (property.featured ? 15 : 0);
    results.push({
      property,
      distanceKm,
      monthlyExpense: cost.monthlyExpense,
      perPersonMonthly: cost.perPersonMonthly,
      firstMonthOutflow: cost.firstMonthOutflow,
      score,
    });
  }
  return sortResults(results, state.sort);
}

export function countActiveFilters(state: SearchState): number {
  const f = state.filters;
  return (
    f.categories.length +
    f.furnishing.length +
    f.gender.length +
    f.occupancy.length +
    f.amenities.length +
    (f.minRent !== null ? 1 : 0) +
    (f.maxRent !== null ? 1 : 0) +
    (f.availableFrom ? 1 : 0) +
    (f.verifiedOnly ? 1 : 0)
  );
}

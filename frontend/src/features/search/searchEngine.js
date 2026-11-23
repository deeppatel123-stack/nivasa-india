import { haversineKm } from '@/features/locations/distance';
import { calculateEffectiveCost } from '@/features/pricing/pricing';

function matchesFilters(property, state) {
  const { filters } = state;
  if (filters.categories.length && !filters.categories.includes(property.category)) return false;
  if (filters.furnishing.length && !property.furnishing) return false;
  if (filters.furnishing.length && !filters.furnishing.includes(property.furnishing)) return false;
  if (filters.gender.length && !property.genderPreference) return false;
  if (filters.gender.length && !filters.gender.includes(property.genderPreference)) return false;
  if (filters.occupancy.length && !property.occupancy) return false;
  if (filters.occupancy.length && !filters.occupancy.includes(property.occupancy)) return false;
  if (filters.amenities.length && !filters.amenities.every((amenity) => property.amenities.includes(amenity))) return false;
  // An unknown rent cannot satisfy a rent constraint.
  const rent = property.prices?.rent;
  if (filters.minRent !== null && !(Number.isFinite(rent) && rent >= filters.minRent)) return false;
  if (filters.maxRent !== null && !(Number.isFinite(rent) && rent <= filters.maxRent)) return false;
  if (filters.verifiedOnly && property.verification !== 'verified') return false;
  if (filters.availableFrom && !(property.availableFrom && property.availableFrom <= filters.availableFrom)) return false;
  return true;
}

function sortResults(results, sort) {
  const copy = [...results];
  switch (sort) {
    case 'distance':
      return copy.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    case 'price_low':
      return copy.sort((a, b) => (a.monthlyExpense ?? Infinity) - (b.monthlyExpense ?? Infinity));
    case 'price_high':
      return copy.sort((a, b) => (b.monthlyExpense ?? -Infinity) - (a.monthlyExpense ?? -Infinity));
    case 'updated':
      return copy.sort(
        (a, b) => new Date(b.property.lastUpdated || 0).getTime() - new Date(a.property.lastUpdated || 0).getTime(),
      );
    default:
      return copy.sort((a, b) => b.score - a.score);
  }
}

/**
 * Ranks genuine records only. Since most open geographic sources do not supply
 * rent, the score rewards proximity and data completeness — never imagined value.
 */
export function searchListings(listings, state, origin) {
  const results = [];
  for (const property of listings) {
    if (property.isDemo) continue;
    if (!matchesFilters(property, state)) continue;
    let distanceKm = property.distanceKm ?? null;
    if (!origin || !property.location?.coordinates) {
      distanceKm = null;
    } else {
      distanceKm = haversineKm(origin, property.location.coordinates);
      if (distanceKm === null || distanceKm > state.radiusKm) continue;
    }
    const cost = calculateEffectiveCost(property.prices, property.occupancy);
    const proximityScore = distanceKm === null ? 40 : Math.max(0, 100 - distanceKm * 12);
    const completenessScore =
      (property.title && property.title !== 'Accommodation name not available' ? 30 : 0) +
      (cost.monthlyExpense !== null ? 30 : 0) +
      (property.contact && Object.values(property.contact).some(Boolean) ? 20 : 0) +
      (Array.isArray(property.images) && property.images.length ? 20 : 0);
    results.push({
      property,
      distanceKm,
      monthlyExpense: cost.monthlyExpense,
      perPersonMonthly: cost.perPersonMonthly,
      firstMonthOutflow: cost.firstMonthOutflow,
      score: proximityScore * 0.6 + completenessScore * 0.4,
    });
  }
  return sortResults(results, state.sort);
}

export function countActiveFilters(state) {
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

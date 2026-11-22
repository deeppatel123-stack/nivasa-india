import { describe, expect, it } from 'vitest';
import { searchListings } from './searchEngine';
import { DEFAULT_SEARCH_STATE } from './types';
import type { Property } from '@/features/listings/types';
import { DEMO_LISTINGS } from '@/features/listings/demoListings';

function listing(overrides: Partial<Property> = {}): Property {
  return { ...DEMO_LISTINGS[0], ...overrides };
}

describe('searchListings', () => {
  it('filters by radius from a search origin', () => {
    const origin = { lat: 22.7756, lng: 72.3056 };
    const results = searchListings(DEMO_LISTINGS, { ...DEFAULT_SEARCH_STATE, radiusKm: 2 }, origin);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((result) => (result.distanceKm ?? 99) <= 2)).toBe(true);
  });

  it('filters by category and rent', () => {
    const state = {
      ...DEFAULT_SEARCH_STATE,
      filters: { ...DEFAULT_SEARCH_STATE.filters, categories: ['hostel' as const], maxRent: 5000 },
    };
    const results = searchListings(DEMO_LISTINGS, state, null);
    expect(results.every((result) => result.property.category === 'hostel' && result.property.prices.rent <= 5000)).toBe(true);
  });

  it('sorts by monthly expense', () => {
    const results = searchListings(DEMO_LISTINGS, { ...DEFAULT_SEARCH_STATE, sort: 'price_low' }, null);
    const expenses = results.map((result) => result.monthlyExpense);
    expect(expenses).toEqual([...expenses].sort((a, b) => a - b));
  });

  it('keeps demo listings identifiable', () => {
    const [first] = searchListings([listing()], DEFAULT_SEARCH_STATE, null);
    expect(first.property.isDemo).toBe(true);
    expect(first.property.contact).toBeNull();
  });
});

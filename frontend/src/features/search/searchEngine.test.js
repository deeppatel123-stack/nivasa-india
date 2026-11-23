import { describe, expect, it } from 'vitest';
import { countActiveFilters, searchListings } from './searchEngine';
import { DEFAULT_SEARCH_STATE, EMPTY_FILTERS } from './types';

const FETCHED_AT = '2026-11-20T08:00:00.000Z';
const ORIGIN = { lat: 22.7756, lng: 72.3056 };

/** A locally built, genuine OSM-style record in the normalised listing shape. */
function genuineListing(overrides = {}) {
    const { prices = {}, location = {}, ...rest } = overrides;
    return {
        id: 'osm-node-1',
        title: 'Genuine accommodation record',
        category: 'hostel',
        location: {
            coordinates: { lat: 22.7756, lng: 72.3056 },
            label: 'Near the river',
            city: 'Ahmedabad',
            ...location,
        },
        prices: {
            rent: 4000,
            deposit: null,
            maintenance: null,
            electricity: null,
            food: null,
            brokerage: null,
            other: null,
            electricityIncluded: false,
            foodIncluded: false,
            ...prices,
        },
        source: {
            name: 'OpenStreetMap',
            url: 'https://www.openstreetmap.org/node/1',
            fetchedAt: FETCHED_AT,
        },
        amenities: ['wifi'],
        verification: 'unverified',
        availability: 'unconfirmed',
        occupancy: 'single',
        furnishing: 'furnished',
        genderPreference: null,
        availableFrom: null,
        contact: null,
        images: [],
        lastUpdated: FETCHED_AT,
        isDemo: false,
        ...rest,
    };
}

describe('searchListings with genuine records', () => {
    it('filters by radius from a resolved search origin', () => {
        const listings = [
            genuineListing({ id: 'near', location: { coordinates: { lat: 22.7775, lng: 72.3075 } } }),
            genuineListing({ id: 'far', location: { coordinates: { lat: 22.8256, lng: 72.3056 } } }),
        ];
        const results = searchListings(listings, { ...DEFAULT_SEARCH_STATE, radiusKm: 2 }, ORIGIN);
        expect(results.map((result) => result.property.id)).toEqual(['near']);
        expect(results[0].distanceKm).toBeLessThan(2);
    });

    it('never treats an unknown rent as free', () => {
        const withoutRent = genuineListing({ id: 'without-rent', prices: { rent: null } });
        const withRent = genuineListing({ id: 'with-rent', prices: { rent: 4000 } });
        const [missing] = searchListings([withoutRent], DEFAULT_SEARCH_STATE, null);
        expect(missing.monthlyExpense).toBeNull();
        expect(missing.perPersonMonthly).toBeNull();

        // A rent constraint with a lower bound rejects records that supply no rent.
        for (const bounds of [{ minRent: 1 }, { minRent: 1, maxRent: 10000 }]) {
            const state = { ...DEFAULT_SEARCH_STATE, filters: { ...EMPTY_FILTERS, ...bounds } };
            expect(searchListings([withoutRent, withRent], state, null).map((result) => result.property.id)).toEqual(['with-rent']);
        }
    });

    it('handles missing inputs without inventing data', () => {
        expect(searchListings([], DEFAULT_SEARCH_STATE, null)).toEqual([]);

        const withoutCoordinates = genuineListing({ id: 'no-coordinates', location: { coordinates: null } });
        const withOrigin = searchListings([withoutCoordinates], { ...DEFAULT_SEARCH_STATE, sort: 'distance' }, ORIGIN);
        expect(withOrigin).toHaveLength(1);
        expect(withOrigin[0].distanceKm).toBeNull();

        const withoutOrigin = searchListings([withoutCoordinates], DEFAULT_SEARCH_STATE, null);
        expect(withoutOrigin).toHaveLength(1);
        expect(withoutOrigin[0].distanceKm).toBeNull();
    });

    it('matches category, rent and verification filters on genuine records', () => {
        const listings = [
            genuineListing({ id: 'match', category: 'hostel', prices: { rent: 4000 }, verification: 'verified' }),
            genuineListing({ id: 'wrong-category', category: 'pg', prices: { rent: 4000 }, verification: 'verified' }),
            genuineListing({ id: 'too-expensive', category: 'hostel', prices: { rent: 20000 }, verification: 'verified' }),
            genuineListing({ id: 'unverified', category: 'hostel', prices: { rent: 4000 } }),
        ];
        const state = {
            ...DEFAULT_SEARCH_STATE,
            filters: { ...EMPTY_FILTERS, categories: ['hostel'], maxRent: 5000, verifiedOnly: true },
        };
        expect(searchListings(listings, state, null).map((result) => result.property.id)).toEqual(['match']);
    });

    it('counts only explicitly active filters', () => {
        expect(countActiveFilters(DEFAULT_SEARCH_STATE)).toBe(0);
        const state = {
            ...DEFAULT_SEARCH_STATE,
            filters: {
                ...EMPTY_FILTERS,
                categories: ['hostel'],
                amenities: ['wifi'],
                minRent: 3000,
                maxRent: 9000,
                availableFrom: '2026-12-01',
                verifiedOnly: true,
            },
        };
        expect(countActiveFilters(state)).toBe(6);
    });

    it('keeps records without a supplied rent out of price sorts', () => {
        const cheap = genuineListing({ id: 'cheap', prices: { rent: 3000 } });
        const expensive = genuineListing({ id: 'expensive', prices: { rent: 12000 } });
        const missingPrice = genuineListing({ id: 'missing-price', prices: { rent: null } });
        const listings = [missingPrice, expensive, cheap];

        const lowToHigh = searchListings(listings, { ...DEFAULT_SEARCH_STATE, sort: 'price_low' }, null);
        expect(lowToHigh.map((result) => result.property.id)).toEqual(['cheap', 'expensive', 'missing-price']);
        expect(lowToHigh.at(-1).monthlyExpense).toBeNull();

        const highToLow = searchListings(listings, { ...DEFAULT_SEARCH_STATE, sort: 'price_high' }, null);
        expect(highToLow.map((result) => result.property.id)).toEqual(['expensive', 'cheap', 'missing-price']);
        expect(highToLow.at(-1).monthlyExpense).toBeNull();
    });
});

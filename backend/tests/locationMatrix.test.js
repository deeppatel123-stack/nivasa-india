import { beforeEach, describe, expect, it, vi } from 'vitest';

const LOCATIONS = [
  { key: 'makarba', query: 'Makarba Ahmedabad', alias: 'Makarba', city: 'Ahmedabad', state: 'Gujarat', lat: 22.9946, lng: 72.5009 },
  { key: 'lj', query: 'LJ University Ahmedabad', alias: 'LJ', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0401, lng: 72.4852 },
  { key: 'nirma', query: 'Nirma University Ahmedabad', alias: 'Nirma', city: 'Ahmedabad', state: 'Gujarat', lat: 23.1287, lng: 72.5444 },
  { key: 'sg', query: 'SG Highway Ahmedabad', alias: 'S.G. Highway', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0762, lng: 72.5083 },
  { key: 'vastrapur', query: 'Vastrapur Ahmedabad', alias: 'Vastrapur', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0389, lng: 72.5246 },
  { key: 'hinjewadi', query: 'Hinjewadi Pune', alias: 'Hinjewadi', city: 'Pune', state: 'Maharashtra', lat: 18.5913, lng: 73.7389 },
  { key: 'powai', query: 'Powai Mumbai', alias: 'Powai', city: 'Mumbai', state: 'Maharashtra', lat: 19.1176, lng: 72.9060 },
  { key: 'koramangala', query: 'Koramangala Bengaluru', alias: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', lat: 12.9352, lng: 77.6245 },
  { key: 'surat', query: 'Surat Gujarat', alias: 'Surat', city: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
  { key: 'jamnagar', query: 'Jamnagar Gujarat', alias: 'Jamnagar', city: 'Jamnagar', state: 'Gujarat', lat: 22.4707, lng: 70.0577 },
];

function placeFor(loc, overrides = {}) {
  return {
    id: `mock:${loc.key}`,
    placeId: `mock:${loc.key}`,
    name: loc.query,
    label: `${loc.query}, ${loc.state}, India`,
    city: loc.city,
    state: loc.state,
    country: 'India',
    countryCode: 'IN',
    coordinates: { lat: loc.lat, lng: loc.lng },
    provider: 'mock',
    ...overrides,
  };
}

function business(id, loc, distanceKm = 1, overrides = {}) {
  const latOffset = distanceKm / 111;
  return {
    externalId: `mock:biz:${id}`,
    provider: 'osm_nominatim',
    recordType: 'accommodation_business',
    title: `Business ${id}`,
    slug: `business-${id}`,
    category: 'hostel',
    address: { label: `${loc.query} Road`, city: loc.city, state: loc.state, country: 'India' },
    coordinates: { lat: loc.lat + latOffset, lng: loc.lng },
    prices: { rent: null, deposit: null, maintenance: null, electricity: null, food: null, brokerage: null, other: null, currency: 'INR' },
    source: { name: 'Mock', url: 'https://example.com', licence: 'mock', fetchedAt: '2026-11-28T00:00:00.000Z' },
    verification: 'unverified',
    isDemo: false,
    ...overrides,
  };
}

function rental(id, loc, distanceKm = 1, rent = 12000) {
  return business(id, loc, distanceKm, {
    externalId: `mock:rental:${id}`,
    recordType: 'rental_listing',
    provider: 'owner_submission',
    prices: { rent, deposit: rent * 2, maintenance: null, electricity: null, food: null, brokerage: null, other: null, currency: 'INR' },
    verification: 'verified',
  });
}

vi.mock('../src/config/env.js', () => ({
  env: {
    nodeEnv: 'test',
    geocoderProvider: 'photon',
    geocodeCacheTtlMs: 1000,
    geocodeMinIntervalMs: 0,
    googleMapsKey: '',
    googlePlacesBaseUrl: 'https://places.googleapis.com/v1',
    googleGeocodeBaseUrl: 'https://maps.googleapis.com/maps/api/geocode',
    discoveryCacheTtlMs: 1000,
    discoveryQueries: ['hostel', 'pg'],
  },
}));

vi.mock('../src/config/db.js', () => ({ dbState: { connected: false, configured: false } }));
vi.mock('../src/models/Listing.js', () => ({ Listing: {} }));

const getCached = vi.fn(() => null);
const setCached = vi.fn();
vi.mock('../src/services/cacheService.js', () => ({ getCached, setCached }));

const photonSuggest = vi.fn();
const nominatimSearch = vi.fn();
const nominatimReverse = vi.fn();
const nominatimLookup = vi.fn();
vi.mock('../src/services/geocoding/providers.js', () => ({ photonSuggest, nominatimSearch, nominatimReverse, nominatimLookup }));

const googleTextSearch = vi.fn();
const googleGeocode = vi.fn();
const googleNearbyAccommodation = vi.fn();
const googleStatus = vi.fn(() => ({ configured: false, keyEnv: 'GOOGLE_MAPS_API_KEY' }));
vi.mock('../src/services/geocoding/googlePlaces.js', () => ({ googleTextSearch, googleGeocode, googleNearbyAccommodation, googleStatus }));

const { suggestPlaces, resolvePlace, __test__ } = await import('../src/services/geocoding/index.js');
const { discoverAccommodation } = await import('../src/services/discoveryService.js');
const { searchListings, annotateRecord } = await import('../src/services/listingService.js');

describe('Phase 2 10-location matrix (mocked, deterministic)', () => {
  beforeEach(() => {
    getCached.mockReset(); getCached.mockReturnValue(null); setCached.mockReset();
    photonSuggest.mockReset(); nominatimSearch.mockReset(); nominatimReverse.mockReset(); nominatimLookup.mockReset();
    googleTextSearch.mockReset(); googleGeocode.mockReset(); googleNearbyAccommodation.mockReset();
  });

  it.each(LOCATIONS)('covers required discovery flow for $query', async (loc) => {
    const place = placeFor(loc);
    const norm = (v) => String(v).toLowerCase().replace(/[.\s]+/g, ' ').trim();
    photonSuggest.mockImplementation(async (q) => {
      const nq = norm(q);
      if (nq.includes(norm(loc.alias)) || nq.includes(norm(loc.city)) || nq.includes(loc.key) || nq.includes(norm(loc.query))) return [place];
      return [];
    });
    nominatimSearch.mockImplementation(async (q) => {
      const nq = norm(q);
      if (nq.includes('hostel') || nq.includes('pg')) return [place, place, { ...place, id: `mock:${loc.key}:far`, placeId: `mock:${loc.key}:far`, name: 'Far place', coordinates: { lat: loc.lat + 1, lng: loc.lng + 1 } }];
      if (nq.includes(norm(loc.alias)) || nq.includes(norm(loc.city)) || nq.includes(norm(loc.query))) return [place];
      return [];
    });
    nominatimReverse.mockResolvedValue(place);

    // Autocomplete
    const suggest = await suggestPlaces(loc.alias, 5);
    expect(suggest.items.length).toBeGreaterThan(0);
    expect(suggest.indiaOnly).toBe(true);
    expect(suggest.items[0].countryCode).toBe('IN');

    // Alias/abbreviation resolution and normalization
    const expanded = __test__.expandQuery(loc.alias);
    expect(expanded.length).toBeGreaterThan(0);
    expect(expanded.join(' ').toLowerCase()).toContain(loc.city.toLowerCase().split(' ')[0]);

    // Lat/lng resolution + country validation
    const resolved = await resolvePlace(loc.query);
    expect(resolved.coordinates.lat).toBeCloseTo(loc.lat, 1);
    expect(resolved.coordinates.lng).toBeCloseTo(loc.lng, 1);
    expect(resolved.countryCode).toBe('IN');
    expect(resolved.indiaOnly).toBe(true);

    // Nearby discovery + radius enforcement + distance + dedupe + categorization
    nominatimSearch.mockImplementation(async (term) => {
      if (['hostel', 'pg'].includes(String(term).toLowerCase())) {
        return [place, place, { ...place, id: `mock:${loc.key}:far`, placeId: `mock:${loc.key}:far`, name: 'Far place', coordinates: { lat: loc.lat + 1, lng: loc.lng + 1 } }];
      }
      return [place];
    });
    const discovery = await discoverAccommodation({ center: { lat: loc.lat, lng: loc.lng }, radiusKm: 5 });
    expect(discovery.diagnostics.providers.length).toBeGreaterThan(0);
    expect(discovery.items.every((i) => i.distanceKm <= 5)).toBe(true);
    const ids = discovery.items.map((i) => i.externalId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(discovery.items.every((i) => i.recordType === 'accommodation_business')).toBe(true);

    // Missing rental info is not fabricated
    expect(discovery.items[0].prices.rent).toBeNull();

    // Search listing categorization / radius / empty states handled below in dedicated tests
    const search = await searchListings({ lat: loc.lat, lng: loc.lng, radiusKm: 5, label: loc.query });
    expect(search.meta.diagnostics.countryValidation).toBe('in_india');
    expect(search.meta.diagnostics.radiusKm).toBe(5);
    expect(search.meta.counts).toBeDefined();
  });

  it('separates rental, business, and demo records', async () => {
    const loc = LOCATIONS[0];
    nominatimSearch.mockResolvedValue([]);
    photonSuggest.mockResolvedValue([]);
    googleNearbyAccommodation.mockResolvedValue([]);
    // Inject through discovery mock by calling searchListings with no providers returning? We'll test annotateRecord + summarization directly.
    const rentalRec = annotateRecord(rental('1', loc, 1, 10000));
    const businessRec = annotateRecord(business('2', loc, 1));
    const demoRec = annotateRecord({ ...business('3', loc, 1), isDemo: true, verification: 'demo', provider: 'demo_seed' });
    expect(rentalRec.recordType).toBe('rental_listing');
    expect(businessRec.recordType).toBe('accommodation_business');
    expect(demoRec.recordType).toBe('demo_listing');
    expect(demoRec.isDemo).toBe(true);
  });

  it('handles provider failures and fallback behavior with diagnostics', async () => {
    nominatimSearch.mockRejectedValue(new Error('timeout'));
    photonSuggest.mockRejectedValue(new Error('timeout'));
    const result = await searchListings({ lat: 23.0225, lng: 72.5714, radiusKm: 5, label: 'Ahmedabad' });
    expect(['providers_unavailable', 'no_accommodation_found']).toContain(result.meta.reason);
    expect(result.meta.diagnostics.providers.length).toBeGreaterThan(0);
  });

  it('rejects foreign/outside-India coordinates', async () => {
    const result = await searchListings({ lat: 51.5074, lng: -0.1278, radiusKm: 5 });
    expect(result.meta.reason).toBe('outside_india');
  });

  it('handles ambiguous locations by requiring selection', async () => {
    nominatimSearch.mockResolvedValue([
      placeFor({ key: 'a', query: 'Makarba', alias: 'Makarba', city: 'Ahmedabad', state: 'Gujarat', lat: 22.9946, lng: 72.5009 }),
      placeFor({ key: 'b', query: 'Makarba', alias: 'Makarba', city: 'Somewhere', state: 'Other', lat: 20.0, lng: 78.0 }),
    ]);
    photonSuggest.mockResolvedValue([]);
    await expect(resolvePlace('Makarba')).rejects.toMatchObject({ status: 400, details: { ambiguous: true } });
  });
});

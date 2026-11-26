import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/config/db.js', () => ({ dbState: { connected: false, configured: false } }));
vi.mock('../src/models/Listing.js', () => ({ Listing: {} }));

const discoverAccommodation = vi.fn();
const toBusinessCandidate = vi.fn((item) => ({ ...item, recordType: 'accommodation_business' }));
const nominatimLookup = vi.fn();

vi.mock('../src/services/discoveryService.js', () => ({
  discoverAccommodation: (...args) => discoverAccommodation(...args),
  discoverNearby: (...args) => discoverAccommodation(...args),
  toBusinessCandidate: (...args) => toBusinessCandidate(...args),
  toListingCandidate: (...args) => toBusinessCandidate(...args),
}));
vi.mock('../src/services/geocoding/providers.js', () => ({
  nominatimLookup: (...args) => nominatimLookup(...args),
}));
vi.mock('../src/services/geocoding/googlePlaces.js', () => ({
  googleStatus: () => ({ configured: false, keyEnv: 'GOOGLE_MAPS_API_KEY' }),
}));

const { searchListings, getListing } = await import('../src/services/listingService.js');

const candidate = (id, lat, rent = null) => ({
  externalId: `osm:way:${id}`,
  provider: 'osm_nominatim',
  title: `Accommodation ${id}`,
  slug: `accommodation-${id}`,
  category: 'hostel',
  address: { label: `${id} Road`, city: 'Pune', state: 'Maharashtra', country: 'India' },
  coordinates: { lat, lng: 73.86 },
  prices: { rent, deposit: null, maintenance: null, electricity: null, food: null, brokerage: null, other: null, currency: 'INR' },
  amenities: [],
  source: { name: 'OpenStreetMap via Nominatim', url: `https://www.openstreetmap.org/way/${id}`, licence: 'ODbL', fetchedAt: '2026-11-23T00:00:00.000Z' },
  verification: 'unverified',
  availability: 'unconfirmed',
  quality: 'information_incomplete',
  isDemo: false,
  distanceKm: 0,
  raw: {},
});

describe('listing search service', () => {
  beforeEach(() => {
    discoverAccommodation.mockReset();
    toBusinessCandidate.mockClear();
    nominatimLookup.mockReset();
  });

  it('requires a resolved location', async () => {
    const result = await searchListings({});
    expect(result.items).toHaveLength(0);
    expect(result.meta.reason).toBe('location_required');
    expect(discoverAccommodation).not.toHaveBeenCalled();
  });

  it('returns only records within radius and never invents rent on live records', async () => {
    discoverAccommodation.mockResolvedValue({
      items: [candidate(1, 18.52), candidate(2, 19.2)],
      diagnostics: { providers: [{ provider: 'osm_nominatim', status: 'ok', rawCount: 2, validCount: 2 }], rawResultCount: 2, validResultCount: 2 },
    });
    const result = await searchListings({ lat: 18.52, lng: 73.86, radiusKm: 5 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].prices.rent).toBeNull();
    expect(result.items[0].recordType).toBe('accommodation_business');
    expect(result.meta.counts.accommodationBusinesses).toBe(1);
  });

  it('rejects coordinates outside India', async () => {
    const result = await searchListings({ lat: 51.5074, lng: -0.1278, radiusKm: 5 });
    expect(result.items).toHaveLength(0);
    expect(result.meta.reason).toBe('outside_india');
    expect(discoverAccommodation).not.toHaveBeenCalled();
  });

  it('supports text search and rejects invalid rent ranges', async () => {
    discoverAccommodation.mockResolvedValue({
      items: [candidate(1, 18.52), candidate(2, 18.521)],
      diagnostics: { providers: [{ provider: 'osm_nominatim', status: 'ok', rawCount: 2, validCount: 2 }], rawResultCount: 2, validResultCount: 2 },
    });
    const filtered = await searchListings({ lat: 18.52, lng: 73.86, q: 'accommodation 2' });
    expect(filtered.items).toHaveLength(1);
    expect(filtered.items[0].title).toBe('Accommodation 2');
    await expect(searchListings({ lat: 18.52, lng: 73.86, minRent: 10000, maxRent: 5000 })).rejects.toThrow(/rent range/);
  });

  it('re-fetches a genuine OSM record by id when the in-memory cache is cold', async () => {
    nominatimLookup.mockResolvedValue([{ id: 'osm:way:42', name: 'Genuine Hostel' }]);
    toBusinessCandidate.mockReturnValue(candidate(42, 18.52));

    const record = await getListing('osm:way:42');

    expect(nominatimLookup).toHaveBeenCalledWith(['W42']);
    expect(record.externalId).toBe('osm:way:42');
    expect(record.recordType).toBe('accommodation_business');
  });

  it('reports diagnostics when providers are unavailable', async () => {
    discoverAccommodation.mockResolvedValue({
      items: [],
      diagnostics: { providers: [{ provider: 'osm_nominatim', status: 'error', error: 'timeout', rawCount: 0, validCount: 0 }], rawResultCount: 0, validResultCount: 0 },
    });
    const result = await searchListings({ lat: 18.52, lng: 73.86, radiusKm: 5 });
    expect(result.meta.reason).toBe('providers_unavailable');
    expect(result.meta.diagnostics.providers.some((p) => p.provider === 'osm_nominatim')).toBe(true);
  });
});

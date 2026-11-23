import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/config/db.js', () => ({ dbState: { connected: false, configured: false } }));
vi.mock('../src/models/Listing.js', () => ({ Listing: {} }));

const discoverNearby = vi.fn();
const toListingCandidate = vi.fn();
const nominatimLookup = vi.fn();

vi.mock('../src/services/discoveryService.js', () => ({
  discoverNearby: (...args) => discoverNearby(...args),
  toListingCandidate: (...args) => toListingCandidate(...args),
}));
vi.mock('../src/services/geocoding/providers.js', () => ({
  nominatimLookup: (...args) => nominatimLookup(...args),
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
    discoverNearby.mockReset();
    toListingCandidate.mockReset();
    nominatimLookup.mockReset();
  });

  it('requires a resolved location', async () => {
    const result = await searchListings({});
    expect(result.items).toHaveLength(0);
    expect(result.meta.reason).toBe('location_required');
    expect(discoverNearby).not.toHaveBeenCalled();
  });

  it('returns only genuine records within radius and never invents rent', async () => {
    discoverNearby.mockResolvedValue({
      items: [candidate(1, 18.52), candidate(2, 19.2)],
      errors: [],
    });
    const result = await searchListings({ lat: 18.52, lng: 73.86, radiusKm: 5 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].prices.rent).toBeNull();
    expect(result.items[0].address.city).toBe('Pune');
    expect(result.meta.source).toBe('osm_nominatim');
  });

  it('supports text search and rejects invalid rent ranges', async () => {
    discoverNearby.mockResolvedValue({ items: [candidate(1, 18.52), candidate(2, 18.521)], errors: [] });
    const filtered = await searchListings({ lat: 18.52, lng: 73.86, q: 'accommodation 2' });
    expect(filtered.items).toHaveLength(1);
    expect(filtered.items[0].title).toBe('Accommodation 2');
    await expect(searchListings({ lat: 18.52, lng: 73.86, minRent: 10000, maxRent: 5000 })).rejects.toThrow(/rent range/);
  });

  it('re-fetches a genuine OSM record by id when the in-memory cache is cold', async () => {
    nominatimLookup.mockResolvedValue([{ id: 'osm:way:42', name: 'Genuine Hostel' }]);
    toListingCandidate.mockReturnValue(candidate(42, 18.52));

    const record = await getListing('osm:way:42');

    expect(nominatimLookup).toHaveBeenCalledWith(['W42']);
    expect(record.externalId).toBe('osm:way:42');
  });
});

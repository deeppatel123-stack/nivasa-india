import { env } from '../config/env.js';
import { getCached, setCached } from './cacheService.js';
import { haversineKm, boundingBox, normaliseText } from '../utils/geo.js';
import { nominatimSearch } from './geocoding/providers.js';

function categoryFor(item) {
  const type = normaliseText(item.type);
  if (type.includes('hostel') || type.includes('student accommodation')) return 'hostel';
  if (type.includes('guest house') || type.includes('guesthouse')) return 'other';
  if (type.includes('apartment')) return 'flat_1bhk';
  return 'other';
}

export function toListingCandidate(item, center, fetchedAt) {
  const address = item.raw?.address || {};
  return {
    externalId: item.id,
    provider: 'osm_nominatim',
    title: item.name || 'Accommodation name not available',
    slug: item.id.replace(/[^a-zA-Z0-9]+/g, '-'),
    category: categoryFor(item),
    description:
      'Genuine OpenStreetMap place record. Rent, deposit, room inventory, availability and contact information are not available from this source.',
    address: {
      label: item.label,
      city: item.city || address.city || '',
      state: item.state || address.state || '',
      country: item.country || 'India',
      postcode: item.postcode || address.postcode || '',
    },
    coordinates: item.coordinates,
    prices: {
      rent: null,
      deposit: null,
      maintenance: null,
      electricity: null,
      food: null,
      brokerage: null,
      other: null,
      currency: 'INR',
    },
    occupancy: null,
    amenities: [],
    images: [],
    contact: { phone: null, email: null, whatsapp: null, verified: false },
    source: {
      name: 'OpenStreetMap via Nominatim',
      url: item.sourceUrl || 'https://www.openstreetmap.org/copyright',
      licence: item.licence || 'Data © OpenStreetMap contributors, ODbL 1.0',
      fetchedAt,
    },
    verification: 'unverified',
    availability: 'unconfirmed',
    quality: 'information_incomplete',
    tags: ['osm', 'geographic-place'],
    isDemo: false,
    distanceKm: center ? Number((haversineKm(center, item.coordinates) ?? 0).toFixed(2)) : null,
    raw: { osmType: item.osmType, osmId: item.osmId, type: item.type, category: item.category },
  };
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.externalId)) return false;
    seen.add(item.externalId);
    return true;
  });
}

/**
 * Discovers genuine accommodation places from OpenStreetMap around a resolved
 * location. Nominatim is queried only for user-triggered searches, at most one
 * request per second, and every response is cached. No prices are invented.
 */
export async function discoverNearby({ center, radiusKm = 5 }) {
  const viewbox = boundingBox(center, radiusKm);
  const key = `discover:${center.lat.toFixed(3)}:${center.lng.toFixed(3)}:${radiusKm}:${env.discoveryQueries.join('|')}`;
  const cached = getCached(key);
  if (cached) return { ...cached, cached: true };

  const collected = [];
  const errors = [];
  const fetchedAt = new Date().toISOString();

  for (const term of env.discoveryQueries) {
    try {
      const items = await nominatimSearch(term, { limit: 15, viewbox, bounded: true });
      collected.push(...items);
    } catch (error) {
      errors.push(`${term}: ${error.message}`);
    }
  }

  const listings = dedupe(collected)
    .map((item) => toListingCandidate(item, center, fetchedAt))
    .filter((listing) => listing.distanceKm <= Number(radiusKm))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const result = {
    items: listings,
    center,
    radiusKm,
    provider: 'osm_nominatim',
    attribution: '© OpenStreetMap contributors, ODbL 1.0',
    completeness: 'information_incomplete',
    errors,
    cached: false,
  };
  if (!errors.length || listings.length) setCached(key, result, env.discoveryCacheTtlMs);
  return result;
}

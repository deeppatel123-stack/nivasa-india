import { env } from '../config/env.js';
import { getCached, setCached } from './cacheService.js';
import { haversineKm, boundingBox, normaliseText, isWithinIndiaBounds } from '../utils/geo.js';
import { nominatimSearch } from './geocoding/providers.js';
import { googleNearbyAccommodation, googleStatus } from './geocoding/googlePlaces.js';

function categoryFor(item) {
  const type = normaliseText(item.type || item.category);
  if (type.includes('hostel') || type.includes('student accommodation')) return 'hostel';
  if (type.includes('guest house') || type.includes('guesthouse') || type.includes('guest_house')) return 'other';
  if (type.includes('apartment')) return 'flat_1bhk';
  if (type.includes('hotel') || type.includes('lodging')) return 'other';
  return 'other';
}

function stableId(item) {
  if (item.id) return item.id;
  return `place:${normaliseText(item.name)}:${Number(item.coordinates?.lat).toFixed(5)}:${Number(item.coordinates?.lng).toFixed(5)}`;
}

export function toBusinessCandidate(item, center, fetchedAt, provider = item.provider || 'osm_nominatim') {
  const address = item.raw?.address || {};
  const isGoogle = String(provider).includes('google');
  return {
    externalId: stableId(item),
    provider: isGoogle ? 'google_places' : 'osm_nominatim',
    recordType: 'accommodation_business',
    title: item.name || 'Accommodation name not available',
    slug: stableId(item).replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase(),
    category: categoryFor(item),
    description: isGoogle
      ? 'Accommodation business found via authorized Google Places data. Rental pricing, room availability, and direct rental terms may be unavailable unless verified by a source.'
      : 'Genuine OpenStreetMap place record. Rent, deposit, room inventory, availability and contact information are not available from this source.',
    address: {
      label: item.label || item.formattedAddress || 'Address not available',
      city: item.city || address.city || '',
      state: item.state || address.state || '',
      country: item.country || 'India',
      postcode: item.postcode || address.postcode || '',
    },
    coordinates: item.coordinates,
    prices: {
      rent: null, deposit: null, maintenance: null, electricity: null, food: null, brokerage: null, other: null, currency: 'INR',
    },
    occupancy: null,
    amenities: [],
    images: [],
    contact: { phone: null, email: null, whatsapp: null, verified: false },
    source: {
      name: isGoogle ? 'Google Places' : 'OpenStreetMap via Nominatim',
      url: item.sourceUrl || (isGoogle ? 'https://maps.google.com/' : 'https://www.openstreetmap.org/copyright'),
      licence: isGoogle ? 'Google Maps Platform Terms apply' : (item.licence || 'Data © OpenStreetMap contributors, ODbL 1.0'),
      fetchedAt,
    },
    verification: 'unverified',
    availability: 'unconfirmed',
    quality: 'information_incomplete',
    tags: [isGoogle ? 'google_places' : 'osm', 'accommodation_business'],
    isDemo: false,
    distanceKm: center ? Number((haversineKm(center, item.coordinates) ?? 0).toFixed(2)) : null,
    raw: { provider, placeId: item.placeId || item.id, type: item.type, category: item.category },
  };
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.externalId || `${normaliseText(item.title)}:${item.coordinates?.lat?.toFixed?.(5)}:${item.coordinates?.lng?.toFixed?.(5)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function runProvider(name, fn) {
  const started = Date.now();
  try {
    const items = await fn();
    return { name, status: 'ok', items, rawCount: items.length, durationMs: Date.now() - started };
  } catch (error) {
    return {
      name,
      status: error.code === 'missing_google_api_key' ? 'missing_credentials' : 'error',
      items: [],
      rawCount: 0,
      error: error.message,
      durationMs: Date.now() - started,
    };
  }
}

export async function discoverAccommodation({ center, radiusKm = 5 }) {
  if (!center || !isWithinIndiaBounds(center.lat, center.lng)) {
    return { items: [], diagnostics: { providers: [], rawResultCount: 0, validResultCount: 0, errors: ['center_outside_india'] }, cached: false };
  }

  const key = `discover:v2:${center.lat.toFixed(3)}:${center.lng.toFixed(3)}:${radiusKm}:${env.discoveryQueries.join('|')}:${env.googleMapsKey ? 'g' : 'nog'}`;
  const cached = getCached(key);
  if (cached) return { ...cached, cached: true };

  const fetchedAt = new Date().toISOString();
  const providerRuns = [];
  const viewbox = boundingBox(center, radiusKm);

  // OSM/Nominatim genuine place discovery.
  providerRuns.push(await runProvider('osm_nominatim', async () => {
    const collected = [];
    for (const term of env.discoveryQueries) {
      const items = await nominatimSearch(term, { limit: 15, viewbox, bounded: true });
      collected.push(...items.map((item) => toBusinessCandidate(item, center, fetchedAt, 'osm_nominatim')));
    }
    return collected;
  }));

  // Google Places Nearby Search when configured.
  if (env.googleMapsKey) {
    providerRuns.push(await runProvider('google_places_nearby', async () => {
      const items = await googleNearbyAccommodation({ center, radiusKm, limit: 20 });
      return items.map((item) => toBusinessCandidate(item, center, fetchedAt, 'google_places'));
    }));
  } else {
    providerRuns.push({ name: 'google_places_nearby', status: 'missing_credentials', items: [], rawCount: 0, error: 'GOOGLE_MAPS_API_KEY not configured', durationMs: 0 });
  }

  const all = dedupe(providerRuns.flatMap((p) => p.items || []))
    .map((item) => ({ ...item, distanceKm: Number((haversineKm(center, item.coordinates) ?? 0).toFixed(2)) }))
    .filter((item) => item.distanceKm <= Number(radiusKm))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const diagnostics = {
    providers: providerRuns.map(({ items, ...rest }) => ({ ...rest, validCount: (items || []).length })),
    rawResultCount: providerRuns.reduce((sum, p) => sum + (p.rawCount || 0), 0),
    validResultCount: all.length,
    google: googleStatus(),
  };

  const result = { items: all, center, radiusKm, diagnostics, cached: false };
  if (all.length || providerRuns.some((p) => p.status === 'ok')) setCached(key, result, env.discoveryCacheTtlMs);
  return result;
}

// Backward-compatible export name used by older tests/imports.
export async function discoverNearby(args) {
  return discoverAccommodation(args);
}

export { toBusinessCandidate as toListingCandidate };

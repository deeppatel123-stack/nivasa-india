import { dbState } from '../config/db.js';
import { env } from '../config/env.js';
import { Listing } from '../models/Listing.js';
import { badRequest, notFound } from '../utils/errors.js';
import { haversineKm, isValidCoordinate, isWithinIndiaBounds, normaliseText } from '../utils/geo.js';
import { discoverAccommodation } from './discoveryService.js';
import { nominatimLookup } from './geocoding/providers.js';
import { DEMO_LISTINGS_SEED } from '../data/demoListings.seed.js';
import { googleStatus } from './geocoding/googlePlaces.js';

const discoveredById = new Map();
const demoById = new Map(DEMO_LISTINGS_SEED.map((item) => [item.externalId, annotateDemo(item)]));

function annotateDemo(item) {
  return {
    ...item,
    recordType: 'demo_listing',
    isDemo: true,
    verification: 'demo',
    source: {
      name: item.source?.name || 'Nivasa Demo Dataset',
      url: item.source?.url || '',
      licence: item.source?.licence || 'Internal demonstration data',
      fetchedAt: item.source?.fetchedAt || new Date().toISOString(),
    },
  };
}

function rememberDiscovered(items) {
  items.forEach((item) => discoveredById.set(item.externalId, item));
}

function toPlain(document) {
  const value = typeof document.toObject === 'function' ? document.toObject() : { ...document };
  delete value._id;
  delete value.__v;
  return annotateRecord(value);
}

function withDistance(listing, center) {
  return {
    ...listing,
    distanceKm: Number((haversineKm(center, listing.coordinates) ?? 0).toFixed(2)),
  };
}

function hasRentalEvidence(listing) {
  const rent = listing?.prices?.rent;
  return rent != null && rent !== '' && Number.isFinite(Number(rent));
}

function classifyRecord(listing) {
  if (listing.isDemo || listing.verification === 'demo' || listing.provider === 'demo_seed') return 'demo_listing';
  if (listing.recordType === 'rental_listing') return hasRentalEvidence(listing) || listing.provider === 'owner_submission' || listing.provider === 'authorized_import' ? 'rental_listing' : 'accommodation_business';
  if (listing.recordType === 'accommodation_business') return 'accommodation_business';
  const rentalSource = listing.provider === 'owner_submission' || listing.provider === 'authorized_import';
  return hasRentalEvidence(listing) || rentalSource ? 'rental_listing' : 'accommodation_business';
}

export function annotateRecord(listing) {
  const recordType = classifyRecord(listing);
  const isDemo = recordType === 'demo_listing';
  return {
    ...listing,
    recordType,
    isDemo,
    verification: isDemo ? 'demo' : (listing.verification || 'unverified'),
  };
}

function demoListings(center, radiusKm) {
  return DEMO_LISTINGS_SEED
    .map(annotateDemo)
    .map((listing) => withDistance(listing, center))
    .filter((listing) => listing.distanceKm <= radiusKm);
}

async function databaseListings(center, radiusKm) {
  if (!dbState.connected) return { items: [], strategy: 'unavailable' };
  const radiusMeters = Math.min(Math.max(Number(radiusKm) || 5, 0.5), 50) * 1000;
  try {
    const documents = await Listing.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [center.lng, center.lat] },
          $maxDistance: radiusMeters,
        },
      },
    }).lean();
    return {
      items: documents
        .map(toPlain)
        .filter((listing) => listing.status !== 'pending' && listing.published !== false)
        .map((listing) => withDistance(listing, center))
        .filter((listing) => listing.distanceKm <= radiusKm),
      strategy: '2dsphere_$near',
    };
  } catch (error) {
    const latDelta = radiusKm / 110.574;
    const lngDelta = radiusKm / (111.32 * Math.max(0.05, Math.cos((center.lat * Math.PI) / 180)));
    const documents = await Listing.find({
      'coordinates.lat': { $gte: center.lat - latDelta, $lte: center.lat + latDelta },
      'coordinates.lng': { $gte: center.lng - lngDelta, $lte: center.lng + lngDelta },
    }).lean();
    return {
      items: documents
        .map(toPlain)
        .filter((listing) => listing.status !== 'pending' && listing.published !== false)
        .map((listing) => withDistance(listing, center))
        .filter((listing) => listing.distanceKm <= radiusKm),
      strategy: `bbox_fallback:${error.message}`,
    };
  }
}

function applyFilters(items, params) {
  const category = normaliseText(params.category);
  const term = normaliseText(params.q);
  const minRent = params.minRent === undefined ? null : Number(params.minRent);
  const maxRent = params.maxRent === undefined ? null : Number(params.maxRent);
  const requestedAmenities = Array.isArray(params.amenities) ? params.amenities.map(normaliseText) : [];
  const recordType = normaliseText(params.recordType);

  return items.filter((listing) => {
    if (recordType && normaliseText(listing.recordType) !== recordType) return false;
    if (category && normaliseText(listing.category) !== category) return false;
    if (term) {
      const haystack = normaliseText([listing.title, listing.address?.label, listing.address?.city, listing.address?.state].join(' '));
      if (!haystack.includes(term)) return false;
    }
    const rent = listing.prices?.rent;
    if (minRent !== null && (!Number.isFinite(rent) || rent < minRent)) return false;
    if (maxRent !== null && (!Number.isFinite(rent) || rent > maxRent)) return false;
    const available = (listing.amenities || []).map(normaliseText);
    if (requestedAmenities.some((amenity) => !available.includes(amenity))) return false;
    return true;
  });
}

function sortListings(items, sort) {
  const copy = [...items];
  if (sort === 'price_low') return copy.sort((a, b) => (a.prices?.rent ?? Infinity) - (b.prices?.rent ?? Infinity));
  if (sort === 'price_high') return copy.sort((a, b) => (b.prices?.rent ?? -Infinity) - (a.prices?.rent ?? -Infinity));
  if (sort === 'updated') return copy.sort((a, b) => new Date(b.source?.fetchedAt || 0).getTime() - new Date(a.source?.fetchedAt || 0).getTime());
  return copy.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
}

function summarize(items) {
  return {
    rentalListings: items.filter((i) => i.recordType === 'rental_listing' && !i.isDemo).length,
    accommodationBusinesses: items.filter((i) => i.recordType === 'accommodation_business' && !i.isDemo).length,
    demoListings: items.filter((i) => i.isDemo).length,
  };
}

function reasonMessage({ reason }) {
  const messages = {
    location_required: 'Resolve a location first to search for nearby accommodation.',
    outside_india: 'Nivasa currently supports locations within India only.',
    no_accommodation_found: 'No accommodation businesses or rental listings were found near this location.',
    providers_unavailable: 'Accommodation providers are currently unavailable. Please try again.',
    quota_exceeded: 'Accommodation search is temporarily unavailable because a provider quota was exceeded. Please try again later.',
    missing_credentials: 'Some accommodation providers are not configured. Results may be incomplete until credentials are added.',
    invalid_response: 'A provider returned an invalid response. Please try again.',
    no_rental_listings: 'No rental listings with pricing evidence were found near this location. Nearby accommodation businesses may still be available.',
  };
  return messages[reason] || 'No results available.';
}

export async function searchListings(params = {}) {
  const lat = Number(params.lat);
  const lng = Number(params.lng);
  const radiusKm = Math.min(Math.max(Number(params.radiusKm) || 5, 0.5), 50);

  const diagnostics = {
    selectedLocation: params.q || params.label || null,
    coordinates: isValidCoordinate(lat, lng) ? { lat, lng } : null,
    countryValidation: isValidCoordinate(lat, lng) ? (isWithinIndiaBounds(lat, lng) ? 'in_india' : 'outside_india') : 'invalid',
    radiusKm,
    providers: [],
    rawResultCount: 0,
    validResultCount: 0,
    filteredResultCount: 0,
    counts: { rentalListings: 0, accommodationBusinesses: 0, demoListings: 0 },
    demoIncluded: false,
    google: googleStatus(),
  };

  if (!isValidCoordinate(lat, lng)) {
    return { items: [], meta: { reason: 'location_required', message: reasonMessage({ reason: 'location_required' }), total: 0, returned: 0, diagnostics } };
  }
  if (!isWithinIndiaBounds(lat, lng)) {
    return { items: [], meta: { reason: 'outside_india', message: reasonMessage({ reason: 'outside_india' }), total: 0, returned: 0, diagnostics } };
  }
  if (
    (params.minRent !== undefined && !Number.isFinite(Number(params.minRent))) ||
    (params.maxRent !== undefined && !Number.isFinite(Number(params.maxRent))) ||
    (params.minRent !== undefined && params.maxRent !== undefined && Number(params.minRent) > Number(params.maxRent))
  ) {
    throw badRequest('Invalid rent range.');
  }

  const center = { lat, lng };
  let source = 'multi_provider';
  let attribution = 'Per-record source attribution';
  let completeness = 'mixed';
  let items = [];

  const stored = await databaseListings(center, radiusKm);
  diagnostics.providers.push({ provider: 'database', status: dbState.connected ? 'ok' : 'not_configured', rawCount: stored.items.length, validCount: stored.items.length, strategy: stored.strategy });
  diagnostics.dbStrategy = stored.strategy;

  if (stored.items.length) {
    items = stored.items;
    source = 'database';
    attribution = 'Stored records with per-record source attribution';
  } else {
    const discovery = await discoverAccommodation({ center, radiusKm });
    items = discovery.items;
    diagnostics.providers.push(...discovery.diagnostics.providers);
    diagnostics.rawResultCount = discovery.diagnostics.rawResultCount;
    diagnostics.validResultCount = discovery.diagnostics.validResultCount;
    rememberDiscovered(items);

    const externalProviders = diagnostics.providers.filter((p) => p.provider !== 'database');
    const allFailed = externalProviders.length > 0 && externalProviders.every((p) => ['error', 'unavailable', 'missing_credentials'].includes(p.status));
    if (!items.length) {
      if (allFailed) {
        return {
          items: [],
          meta: {
            reason: 'providers_unavailable',
            message: reasonMessage({ reason: 'providers_unavailable' }),
            total: 0, returned: 0, source: 'unavailable', attribution, completeness: 'unknown', radiusKm, center, demoIncluded: false, diagnostics,
          },
        };
      }
      if (env.nodeEnv !== 'production') {
        items = demoListings(center, radiusKm);
        source = 'demo_seed';
        attribution = 'Nivasa Demo Dataset (development/testing only)';
        completeness = 'demo';
        diagnostics.providers.push({ provider: 'demo_seed', status: items.length ? 'ok' : 'empty', rawCount: DEMO_LISTINGS_SEED.length, validCount: items.length, note: 'Development/testing fallback only; clearly labeled DEMO DATA.' });
      }
    }
  }

  const inRadius = items.map(annotateRecord).map((listing) => withDistance(listing, center)).filter((listing) => (haversineKm(center, listing.coordinates) ?? Infinity) <= radiusKm);
  const filtered = sortListings(applyFilters(inRadius, params), params.sort);
  const offset = Math.max(0, Number.parseInt(params.offset, 10) || 0);
  const limit = Math.min(Math.max(Number.parseInt(params.limit, 10) || 50, 1), 100);
  const paged = filtered.slice(offset, offset + limit);
  const counts = summarize(filtered);
  diagnostics.rawResultCount = diagnostics.rawResultCount || inRadius.length;
  diagnostics.validResultCount = diagnostics.validResultCount || inRadius.length;
  diagnostics.filteredResultCount = filtered.length;
  diagnostics.counts = counts;
  diagnostics.demoIncluded = counts.demoListings > 0;

  let reason = null;
  if (!filtered.length) {
    const providerStates = diagnostics.providers.filter((p) => p.provider !== 'database').map((p) => p.status);
    const hasQuota = providerStates.some((s) => s === 'quota_exceeded');
    const hasMissingCreds = providerStates.some((s) => s === 'missing_credentials');
    const hasInvalid = providerStates.some((s) => s === 'invalid_response');
    const hasOk = diagnostics.providers.some((p) => p.status === 'ok' || p.status === 'empty');
    if (hasOk) reason = 'no_accommodation_found';
    else if (hasQuota) reason = 'quota_exceeded';
    else if (hasMissingCreds) reason = 'missing_credentials';
    else if (hasInvalid) reason = 'invalid_response';
    else reason = 'providers_unavailable';
  } else if (counts.rentalListings === 0 && counts.accommodationBusinesses > 0) {
    reason = 'no_rental_listings';
  }

  return {
    items: paged,
    meta: {
      reason,
      message: reasonMessage({ reason }),
      total: filtered.length,
      returned: paged.length,
      source,
      attribution,
      completeness,
      radiusKm,
      center,
      demoIncluded: diagnostics.demoIncluded,
      counts,
      diagnostics,
      note: diagnostics.demoIncluded
        ? 'DEMO DATA is included only for development/testing where live rental inventory is unavailable. Demo listings are clearly labeled and are not verified properties.'
        : 'Prices, availability and contact details are shown as "Not available" unless a source provided them. Map/business records are not rental listings unless rental evidence exists.',
    },
  };
}

export async function getListing(id) {
  if (dbState.connected) {
    const document = await Listing.findOne({ $or: [{ externalId: id }, { slug: id }] }).lean();
    if (document) return annotateRecord(toPlain(document));
  }
  const discovered = discoveredById.get(id);
  if (discovered) return annotateRecord(discovered);
  const demo = demoById.get(id);
  if (demo) return annotateDemo(demo);

  const osmMatch = /^osm:(node|way|relation):(\d+)$/.exec(id);
  if (osmMatch) {
    const prefix = { node: 'N', way: 'W', relation: 'R' }[osmMatch[1]];
    try {
      const items = await nominatimLookup([`${prefix}${osmMatch[2]}`]);
      if (items.length) {
        const { toBusinessCandidate } = await import('./discoveryService.js');
        const record = toBusinessCandidate(items[0], null, new Date().toISOString());
        discoveredById.set(record.externalId, record);
        return annotateRecord(record);
      }
    } catch (error) {
      console.warn('[listings] OSM lookup failed:', error.message);
    }
  }
  throw notFound('No listing record was found for this id.');
}

export async function upsertListings(records) {
  if (!dbState.connected) return { stored: 0, reason: 'persistence_not_configured' };
  let stored = 0;
  for (const record of records) {
    const annotated = annotateRecord(record);
    await Listing.updateOne({ externalId: annotated.externalId }, { $set: annotated }, { upsert: true });
    stored += 1;
  }
  return { stored, reason: null };
}

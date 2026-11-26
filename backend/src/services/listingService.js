import { dbState } from '../config/db.js';
import { Listing } from '../models/Listing.js';
import { badRequest, notFound } from '../utils/errors.js';
import { boundingBox, haversineKm, isValidCoordinate, isWithinIndiaBounds, normaliseText } from '../utils/geo.js';
import { discoverNearby, toListingCandidate } from './discoveryService.js';
import { nominatimLookup } from './geocoding/providers.js';
import { DEMO_LISTINGS_SEED } from '../data/demoListings.seed.js';

const discoveredById = new Map();
const demoById = new Map(DEMO_LISTINGS_SEED.map((item) => [item.externalId, item]));

function rememberDiscovered(items) {
  items.forEach((item) => discoveredById.set(item.externalId, item));
}

function toPlain(document) {
  const value = typeof document.toObject === 'function' ? document.toObject() : { ...document };
  delete value._id;
  delete value.__v;
  return value;
}

function withDistance(listing, center) {
  return {
    ...listing,
    distanceKm: Number((haversineKm(center, listing.coordinates) ?? 0).toFixed(2)),
  };
}

function demoListings(center, radiusKm) {
  return DEMO_LISTINGS_SEED
    .map((listing) => withDistance(listing, center))
    .filter((listing) => listing.distanceKm <= radiusKm);
}

async function databaseListings(center, radiusKm) {
  if (!dbState.connected) return [];
  const [west, north, east, south] = boundingBox(center, radiusKm);
  const documents = await Listing.find({
    'coordinates.lat': { $gte: south, $lte: north },
    'coordinates.lng': { $gte: west, $lte: east },
  }).lean();
  return documents
    .map(toPlain)
    .filter((listing) => listing.status !== 'pending' && listing.published !== false)
    .map((listing) => withDistance(listing, center))
    .filter((listing) => listing.distanceKm <= radiusKm);
}

function applyFilters(items, params) {
  const category = normaliseText(params.category);
  const term = normaliseText(params.q);
  const minRent = params.minRent === undefined ? null : Number(params.minRent);
  const maxRent = params.maxRent === undefined ? null : Number(params.maxRent);
  const requestedAmenities = Array.isArray(params.amenities) ? params.amenities.map(normaliseText) : [];

  return items.filter((listing) => {
    if (category && normaliseText(listing.category) !== category) return false;
    if (term) {
      const haystack = normaliseText(
        [listing.title, listing.address?.label, listing.address?.city, listing.address?.state].join(' '),
      );
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
  if (sort === 'price_low') {
    return copy.sort((a, b) => (a.prices?.rent ?? Infinity) - (b.prices?.rent ?? Infinity));
  }
  if (sort === 'price_high') {
    return copy.sort((a, b) => (b.prices?.rent ?? -Infinity) - (a.prices?.rent ?? -Infinity));
  }
  if (sort === 'updated') {
    return copy.sort(
      (a, b) => new Date(b.source?.fetchedAt || 0).getTime() - new Date(a.source?.fetchedAt || 0).getTime(),
    );
  }
  return copy.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
}

export async function searchListings(params = {}) {
  const lat = Number(params.lat);
  const lng = Number(params.lng);
  const radiusKm = Math.min(Math.max(Number(params.radiusKm) || 5, 0.5), 50);

  if (!isValidCoordinate(lat, lng)) {
    return {
      items: [],
      meta: {
        reason: 'location_required',
        message: 'Resolve a location first to search for genuine nearby accommodation records.',
        total: 0,
        returned: 0,
      },
    };
  }
  if (!isWithinIndiaBounds(lat, lng)) {
    return {
      items: [],
      meta: {
        reason: 'outside_india',
        message: 'Nivasa currently supports locations within India only.',
        total: 0,
        returned: 0,
      },
    };
  }

  if (
    (params.minRent !== undefined && !Number.isFinite(Number(params.minRent))) ||
    (params.maxRent !== undefined && !Number.isFinite(Number(params.maxRent))) ||
    (params.minRent !== undefined && params.maxRent !== undefined && Number(params.minRent) > Number(params.maxRent))
  ) {
    throw badRequest('Invalid rent range.');
  }

  const center = { lat, lng };
  let source = 'osm_nominatim';
  let attribution = '© OpenStreetMap contributors, ODbL 1.0';
  let completeness = 'information_incomplete';
  let items = [];
  let discoveryErrors = [];

  const stored = await databaseListings(center, radiusKm);
  if (stored.length) {
    source = 'database';
    attribution = 'Stored records with per-record source attribution';
    completeness = 'mixed';
    items = stored;
  } else {
    const discovery = await discoverNearby({ center, radiusKm });
    items = discovery.items;
    discoveryErrors = discovery.errors;
    rememberDiscovered(items);
    if (!items.length) {
      // Demo fallback is explicit and never presented as verified/live inventory.
      items = demoListings(center, radiusKm);
      source = 'demo_seed';
      attribution = 'Nivasa Demo Dataset (development/testing only)';
      completeness = 'demo';
    }
  }

  // Enforce radius for every source, not just the upstream discovery query.
  const inRadius = items.filter(
    (listing) => (haversineKm(center, listing.coordinates) ?? Infinity) <= radiusKm,
  );
  const filtered = sortListings(applyFilters(inRadius, params), params.sort);
  const offset = Math.max(0, Number.parseInt(params.offset, 10) || 0);
  const limit = Math.min(Math.max(Number.parseInt(params.limit, 10) || 50, 1), 100);

  const demoIncluded = filtered.some((item) => item.isDemo);
  return {
    items: filtered.slice(offset, offset + limit),
    meta: {
      reason: null,
      total: filtered.length,
      returned: Math.min(limit, Math.max(0, filtered.length - offset)),
      source,
      attribution,
      completeness,
      radiusKm,
      center,
      demoIncluded,
      note: demoIncluded
        ? 'DEMO DATA is included for development/testing where live rental inventory is unavailable. Demo listings are clearly labeled and are not verified properties.'
        : 'Prices, availability and contact details are shown as "Not available" unless a source provided them.',
      upstreamErrors: discoveryErrors,
    },
  };
}

export async function getListing(id) {
  if (dbState.connected) {
    const document = await Listing.findOne({ $or: [{ externalId: id }, { slug: id }] }).lean();
    if (document) return toPlain(document);
  }
  const discovered = discoveredById.get(id);
  if (discovered) return discovered;
  const demo = demoById.get(id);
  if (demo) return demo;

  // A shared record URL must work even after a backend restart. Re-fetch the
  // genuine OSM object by id instead of inventing a placeholder record.
  const osmMatch = /^osm:(node|way|relation):(\d+)$/.exec(id);
  if (osmMatch) {
    const prefix = { node: 'N', way: 'W', relation: 'R' }[osmMatch[1]];
    try {
      const items = await nominatimLookup([`${prefix}${osmMatch[2]}`]);
      if (items.length) {
        const record = toListingCandidate(items[0], null, new Date().toISOString());
        discoveredById.set(record.externalId, record);
        return record;
      }
    } catch (error) {
      console.warn('[listings] OSM lookup failed:', error.message);
    }
  }
  throw notFound('No genuine listing record was found for this id.');
}

export async function upsertListings(records) {
  if (!dbState.connected) return { stored: 0, reason: 'persistence_not_configured' };
  let stored = 0;
  for (const record of records) {
    await Listing.updateOne({ externalId: record.externalId }, { $set: record }, { upsert: true });
    stored += 1;
  }
  return { stored, reason: null };
}

import { env } from '../../config/env.js';
import { schedule } from '../rateLimitService.js';
import { isWithinIndiaBounds, validateIndiaLocation } from '../../utils/geo.js';

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(10000),
    headers: {
      'User-Agent': env.geocoderUserAgent,
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
  return response.json();
}

function osmReference(osmType, osmId) {
  if (!osmType || !osmId) return '';
  return `https://www.openstreetmap.org/${osmType}/${osmId}`;
}

const CATEGORY_MAP = {
  amenity: 'amenity', shop: 'shop', tourism: 'landmark', leisure: 'leisure',
  railway: 'transit', aeroway: 'transit', highway: 'road', building: 'building',
  place: 'place', office: 'office', boundary: 'administrative', natural: 'natural',
};

function normaliseCategory(item) {
  const category = String(item.category || item.class || '').toLowerCase();
  const type = String(item.type || '').toLowerCase();
  if (['university', 'college', 'school'].includes(type)) return 'education';
  if (['hospital', 'clinic'].includes(type)) return 'healthcare';
  if (['station', 'halt', 'stop', 'aerodrome'].includes(type)) return 'transit';
  if (['hotel', 'hostel', 'guest_house', 'apartment'].includes(type)) return 'accommodation';
  if (category === 'place') return type || 'place';
  return CATEGORY_MAP[category] || category || type || 'place';
}

function toNominatimItem(item) {
  const address = item.address || {};
  const lat = Number(item.lat);
  const lng = Number(item.lon);
  const countryCode = String(address.country_code || '').toLowerCase();
  const country = address.country || 'India';
  const city = address.city || address.town || address.village || address.municipality || address.hamlet || address.county || '';
  const district = address.state_district || address.district || address.county || '';
  const locality = address.suburb || address.neighbourhood || address.quarter || address.residential || address.road || '';
  return {
    id: `osm:${item.osm_type}:${item.osm_id}`,
    placeId: `osm:${item.osm_type}:${item.osm_id}`,
    osmType: item.osm_type,
    osmId: item.osm_id,
    name: item.name || item.display_name?.split(',')[0] || '',
    label: item.display_name || '',
    formattedAddress: item.display_name || '',
    locality,
    district,
    city,
    state: address.state || '',
    country: countryCode === 'in' ? 'India' : country,
    countryCode: countryCode || (isWithinIndiaBounds(lat, lng) ? 'in' : ''),
    postcode: address.postcode || '',
    category: normaliseCategory(item),
    type: item.type || '',
    coordinates: { lat, lng },
    provider: 'osm_nominatim',
    licence: item.licence || 'Data © OpenStreetMap contributors, ODbL 1.0',
    sourceUrl: osmReference(item.osm_type, item.osm_id),
    raw: item,
  };
}

function toPhotonItem(feature) {
  const p = feature.properties || {};
  const [lng, lat] = feature.geometry?.coordinates || [];
  const countryCode = String(p.countrycode || '').toLowerCase();
  const city = p.city || p.town || p.village || p.county || '';
  const locality = p.district || p.suburb || p.locality || p.name || '';
  const label = [p.name, p.district, city, p.state, countryCode === 'in' ? 'India' : p.country].filter(Boolean).join(', ');
  return {
    id: `photon:${p.osm_type}:${p.osm_id}`,
    placeId: `photon:${p.osm_type}:${p.osm_id}`,
    osmType: p.osm_type,
    osmId: p.osm_id,
    name: p.name || '',
    label,
    formattedAddress: label,
    locality: p.district || p.suburb || p.locality || '',
    district: p.county || '',
    city,
    state: p.state || '',
    country: countryCode === 'in' ? 'India' : p.country || '',
    countryCode,
    postcode: p.postcode || '',
    category: normaliseCategory(p),
    type: p.type || '',
    coordinates: { lat: Number(lat), lng: Number(lng) },
    provider: 'photon',
    sourceUrl: osmReference(p.osm_type, p.osm_id),
    raw: feature,
  };
}

// India-first filter: drop any result that fails central validation.
function filterIndia(items) {
  return items.filter((item) => validateIndiaLocation(item).ok);
}

/** Nominatim lookup lets a shared record URL survive an API restart. */
export async function nominatimLookup(osmIds) {
  const params = new URLSearchParams({
    osm_ids: osmIds.join(','),
    format: 'jsonv2',
    addressdetails: '1',
    'accept-language': 'en',
  });
  const url = `${env.nominatimUrl}/lookup?${params.toString()}`;
  const payload = await schedule('nominatim', env.geocodeMinIntervalMs, () => fetchJson(url));
  return filterIndia((Array.isArray(payload) ? payload : []).map(toNominatimItem));
}

/**
 * Photon typeahead. We request extra results and apply:
 * 1) bbox around India as provider-level geographic bias/restriction.
 * 2) countryCode=IN filtering in normalization.
 * 3) central validateIndiaLocation() on the normalized output.
 */
export async function photonSuggest(query, limit = 6) {
  const params = new URLSearchParams({
    q: query,
    limit: String(Math.min(Math.max(limit * 3, limit), 15)),
    lang: 'en',
    bbox: '68.0,6.0,97.6,37.6',
  });
  const url = `${env.photonUrl}/api/?${params.toString()}`;
  const payload = await schedule('photon', env.geocodeMinIntervalMs, () => fetchJson(url));
  return filterIndia((payload.features || []).map(toPhotonItem)).slice(0, limit);
}

export async function nominatimSearch(query, { limit = 5, viewbox, bounded = false } = {}) {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    'accept-language': 'en',
    countrycodes: 'in', // Nominatim India restriction
    limit: String(Math.min(Math.max(limit * 2, limit), 20)),
  });
  if (viewbox) {
    params.set('viewbox', viewbox.join(','));
    params.set('bounded', bounded ? '1' : '0');
  }
  const url = `${env.nominatimUrl}/search?${params.toString()}`;
  const payload = await schedule('nominatim', env.geocodeMinIntervalMs, () => fetchJson(url));
  return filterIndia((Array.isArray(payload) ? payload : []).map(toNominatimItem)).slice(0, limit);
}

export async function nominatimReverse(lat, lng) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'jsonv2',
    zoom: '16',
    addressdetails: '1',
    'accept-language': 'en',
  });
  const url = `${env.nominatimUrl}/reverse?${params.toString()}`;
  const item = await schedule('nominatim', env.geocodeMinIntervalMs, () => fetchJson(url));
  const normalized = toNominatimItem(item);
  const validation = validateIndiaLocation(normalized);
  if (!validation.ok) return null;
  return normalized;
}

/** Optional Google adapter. Kept India-restricted for parity with the default provider. */
export async function googlePlacesSearch(query) {
  if (!env.googleMapsKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not configured');
  }
  const payload = await fetchJson('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'X-Goog-Api-Key': env.googleMapsKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.googleMapsUri,places.addressComponents',
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: 10,
      includedRegionCodes: ['in'], // Google Places India restriction
    }),
  });
  return filterIndia(
    (payload.places || []).map((place) => {
      const components = place.addressComponents || [];
      const pick = (type) => components.find((c) => c.types?.includes(type))?.longText || '';
      const countryCode = (components.find((c) => c.types?.includes('country'))?.shortText || '').toLowerCase();
      return {
        id: `google:${place.id}`,
        placeId: place.id,
        name: place.displayName?.text || '',
        label: place.formattedAddress || '',
        formattedAddress: place.formattedAddress || '',
        city: pick('locality') || pick('administrative_area_level_2'),
        state: pick('administrative_area_level_1'),
        country: countryCode === 'in' ? 'India' : pick('country'),
        countryCode,
        postcode: pick('postal_code'),
        category: (place.types || [])[0] || 'place',
        coordinates: { lat: place.location?.latitude, lng: place.location?.longitude },
        provider: 'google_places',
        sourceUrl: place.googleMapsUri || '',
        raw: place,
      };
    }),
  );
}

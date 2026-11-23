import { env } from '../../config/env.js';
import { schedule } from '../rateLimitService.js';

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

function toNominatimItem(item) {
  const address = item.address || {};
  return {
    id: `osm:${item.osm_type}:${item.osm_id}`,
    osmType: item.osm_type,
    osmId: item.osm_id,
    name: item.name || '',
    label: item.display_name || '',
    city: address.city || address.town || address.village || address.county || '',
    state: address.state || '',
    country: address.country || 'India',
    postcode: address.postcode || '',
    category: item.category || '',
    type: item.type || '',
    coordinates: { lat: Number(item.lat), lng: Number(item.lon) },
    provider: 'osm_nominatim',
    licence: item.licence || 'Data © OpenStreetMap contributors, ODbL 1.0',
    sourceUrl: osmReference(item.osm_type, item.osm_id),
    raw: item,
  };
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
  return (Array.isArray(payload) ? payload : []).map(toNominatimItem);
}

/** Photon supports typeahead; Nominatim explicitly does not. */
export async function photonSuggest(query, limit = 6) {
  const url = `${env.photonUrl}/api/?q=${encodeURIComponent(query)}&limit=${limit}&lang=en`;
  const payload = await schedule('photon', env.geocodeMinIntervalMs, () => fetchJson(url));
  return (payload.features || []).map((feature) => {
    const p = feature.properties || {};
    const [lng, lat] = feature.geometry?.coordinates || [];
    const city = p.city || p.county || p.town || p.village || '';
    return {
      id: `photon:${p.osm_type}:${p.osm_id}`,
      name: p.name || '',
      label: [p.name, p.street, city, p.state, p.country].filter(Boolean).join(', '),
      city,
      state: p.state || '',
      country: p.country || 'India',
      coordinates: { lat, lng },
      provider: 'photon',
      sourceUrl: osmReference(p.osm_type, p.osm_id),
    };
  });
}

export async function nominatimSearch(query, { limit = 5, viewbox, bounded = false } = {}) {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    'accept-language': 'en',
    limit: String(limit),
  });
  if (viewbox) {
    params.set('viewbox', viewbox.join(','));
    params.set('bounded', bounded ? '1' : '0');
  }
  const url = `${env.nominatimUrl}/search?${params.toString()}`;
  const payload = await schedule('nominatim', env.geocodeMinIntervalMs, () => fetchJson(url));
  return (Array.isArray(payload) ? payload : []).map(toNominatimItem);
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
  const address = item.address || {};
  return {
    id: `osm:${item.osm_type}:${item.osm_id}`,
    label: item.display_name || '',
    city: address.city || address.town || address.village || address.county || '',
    state: address.state || '',
    coordinates: { lat: Number(item.lat), lng: Number(item.lon) },
    provider: 'osm_nominatim',
    sourceUrl: osmReference(item.osm_type, item.osm_id),
  };
}

/** Requires a billing-enabled Google Cloud project with Places API (New) + key. */
export async function googlePlacesSearch(query) {
  if (!env.googleMapsKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not configured');
  }
  const payload = await fetchJson('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'X-Goog-Api-Key': env.googleMapsKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.googleMapsUri',
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 10 }),
  });
  return (payload.places || []).map((place) => ({
    id: `google:${place.id}`,
    name: place.displayName?.text || '',
    label: place.formattedAddress || '',
    coordinates: { lat: place.location?.latitude, lng: place.location?.longitude },
    provider: 'google_places',
    sourceUrl: place.googleMapsUri || '',
    raw: place,
  }));
}

import { env } from '../../config/env.js';
import { isWithinIndiaBounds, validateIndiaLocation } from '../../utils/geo.js';

const DEFAULT_TIMEOUT_MS = 10000;

function requireGoogleKey() {
  if (!env.googleMapsKey) {
    const error = new Error('GOOGLE_MAPS_API_KEY is not configured');
    error.code = 'missing_google_api_key';
    throw error;
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error?.message || payload?.error_message || `Google API returned ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.code = payload?.error?.status || payload?.status || 'google_api_error';
    error.details = payload;
    throw error;
  }
  return payload;
}

function pickComponent(components = [], type) {
  const component = components.find((c) => (c.types || []).includes(type));
  return component?.longText || component?.shortText || component?.long_name || component?.short_name || '';
}

function pickShortComponent(components = [], type) {
  const component = components.find((c) => (c.types || []).includes(type));
  return component?.shortText || component?.short_name || component?.longText || component?.long_name || '';
}

function normalizeGooglePlace(place, provider = 'google_places') {
  const components = place.addressComponents || place.address_components || [];
  const lat = Number(place.location?.latitude ?? place.geometry?.location?.lat);
  const lng = Number(place.location?.longitude ?? place.geometry?.location?.lng);
  const countryCode = String(pickShortComponent(components, 'country') || '').toLowerCase();
  const country = pickComponent(components, 'country') || (countryCode === 'in' ? 'India' : '');
  const locality =
    pickComponent(components, 'sublocality_level_1') ||
    pickComponent(components, 'sublocality') ||
    pickComponent(components, 'neighborhood') ||
    pickComponent(components, 'route') ||
    '';
  const city =
    pickComponent(components, 'locality') ||
    pickComponent(components, 'postal_town') ||
    pickComponent(components, 'administrative_area_level_2') ||
    '';
  const state = pickComponent(components, 'administrative_area_level_1') || '';
  const postcode = pickComponent(components, 'postal_code') || '';
  const name = place.displayName?.text || place.name?.text || place.name || '';
  const label = place.formattedAddress || place.formatted_address || name;
  const id = place.id || place.place_id || '';

  const normalized = {
    id: id ? `google:${id}` : `google:${lat},${lng}`,
    placeId: id,
    name: name || label.split(',')[0] || '',
    label,
    formattedAddress: label,
    locality,
    district: pickComponent(components, 'administrative_area_level_3') || pickComponent(components, 'administrative_area_level_2') || '',
    city,
    state,
    country: countryCode === 'in' ? 'India' : country,
    countryCode,
    postcode,
    category: (place.types || [])[0] || (place.primaryType ? String(place.primaryType) : 'place'),
    type: (place.types || [])[0] || place.primaryType || '',
    coordinates: { lat, lng },
    provider,
    sourceUrl: place.googleMapsUri || place.url || '',
    raw: place,
  };
  return validateIndiaLocation(normalized).ok ? normalized : null;
}

function normalizeLegacyGeocodeResult(result) {
  const components = result.address_components || [];
  const lat = Number(result.geometry?.location?.lat);
  const lng = Number(result.geometry?.location?.lng);
  const countryCode = String(pickShortComponent(components, 'country') || '').toLowerCase();
  const normalized = {
    id: `google:${result.place_id || `${lat},${lng}`}`,
    placeId: result.place_id || '',
    name: result.formatted_address?.split(',')[0] || '',
    label: result.formatted_address || '',
    formattedAddress: result.formatted_address || '',
    locality:
      pickComponent(components, 'sublocality_level_1') ||
      pickComponent(components, 'sublocality') ||
      pickComponent(components, 'neighborhood') ||
      '',
    district: pickComponent(components, 'administrative_area_level_2') || '',
    city:
      pickComponent(components, 'locality') ||
      pickComponent(components, 'postal_town') ||
      pickComponent(components, 'administrative_area_level_2') ||
      '',
    state: pickComponent(components, 'administrative_area_level_1') || '',
    country: countryCode === 'in' ? 'India' : pickComponent(components, 'country'),
    countryCode,
    postcode: pickComponent(components, 'postal_code') || '',
    category: (result.types || [])[0] || 'place',
    type: (result.types || [])[0] || '',
    coordinates: { lat, lng },
    provider: 'google_geocode',
    sourceUrl: result.place_id ? `https://www.google.com/maps/place/?q=place_id:${result.place_id}` : '',
    raw: result,
  };
  return validateIndiaLocation(normalized).ok ? normalized : null;
}

export function googleStatus() {
  return {
    configured: Boolean(env.googleMapsKey),
    keyEnv: 'GOOGLE_MAPS_API_KEY',
    apis: ['places_text_search_new', 'places_nearby_search_new', 'geocoding_api'],
    indiaOnly: true,
  };
}

export async function googleTextSearch(query, { limit = 5, locationBias } = {}) {
  requireGoogleKey();
  const body = {
    textQuery: query,
    maxResultCount: Math.min(Math.max(limit, 1), 20),
    includedRegionCodes: ['in'],
    languageCode: 'en',
  };
  if (locationBias?.lat != null && locationBias?.lng != null && isWithinIndiaBounds(locationBias.lat, locationBias.lng)) {
    body.locationBias = {
      circle: {
        center: { latitude: locationBias.lat, longitude: locationBias.lng },
        radius: Math.max(500, Math.min(Number(locationBias.radiusMeters) || 50000, 50000)),
      },
    };
  }

  const payload = await fetchJson(`${env.googlePlacesBaseUrl}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env.googleMapsKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.primaryType,places.googleMapsUri,places.addressComponents',
    },
    body: JSON.stringify(body),
  });

  return (payload.places || []).map((p) => normalizeGooglePlace(p, 'google_places')).filter(Boolean).slice(0, limit);
}

export async function googleNearbyAccommodation({ center, radiusKm = 5, limit = 20 }) {
  requireGoogleKey();
  const radiusMeters = Math.max(500, Math.min(Math.round(Number(radiusKm) * 1000), 50000));
  const payload = await fetchJson(`${env.googlePlacesBaseUrl}/places:searchNearby`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env.googleMapsKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.primaryType,places.googleMapsUri,places.addressComponents,places.businessStatus',
    },
    body: JSON.stringify({
      includedTypes: ['hostel', 'guest_house', 'lodging'],
      maxResultCount: Math.min(Math.max(limit, 1), 20),
      locationRestriction: {
        circle: {
          center: { latitude: center.lat, longitude: center.lng },
          radius: radiusMeters,
        },
      },
      languageCode: 'en',
      regionCode: 'in',
    }),
  });

  return (payload.places || []).map((p) => normalizeGooglePlace(p, 'google_places')).filter(Boolean);
}

export async function googleGeocode(query) {
  requireGoogleKey();
  const params = new URLSearchParams({
    address: query,
    key: env.googleMapsKey,
    components: 'country:IN',
    language: 'en',
  });
  const payload = await fetchJson(`${env.googleGeocodeBaseUrl}/json?${params.toString()}`);
  if (payload.status === 'ZERO_RESULTS') return [];
  if (payload.status !== 'OK') {
    const error = new Error(payload.error_message || `Google Geocoding returned ${payload.status}`);
    error.code = payload.status;
    error.details = payload;
    throw error;
  }
  return (payload.results || []).map(normalizeLegacyGeocodeResult).filter(Boolean);
}

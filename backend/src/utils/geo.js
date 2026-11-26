const EARTH_RADIUS_KM = 6371;

export function haversineKm(a, b) {
  if (!a || !b || !Number.isFinite(a.lat) || !Number.isFinite(a.lng) || !Number.isFinite(b.lat) || !Number.isFinite(b.lng)) {
    return null;
  }
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Bounding box covering a radius, expressed as Nominatim's left,top,right,bottom. */
export function boundingBox(center, radiusKm) {
  const safeRadius = Math.min(Math.max(Number(radiusKm) || 5, 0.5), 50);
  const latDelta = safeRadius / 110.574;
  const lngDelta = safeRadius / (111.32 * Math.max(0.05, Math.cos((center.lat * Math.PI) / 180)));
  return [center.lng - lngDelta, center.lat + latDelta, center.lng + lngDelta, center.lat - latDelta];
}

export function isValidCoordinate(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

// Broad India extent (including island territories) for validating ambiguous inputs.
export const INDIA_BOUNDS = { minLat: 6.0, maxLat: 37.6, minLng: 68.0, maxLng: 97.6 };

export function isWithinIndiaBounds(lat, lng) {
  return isValidCoordinate(lat, lng) && lat >= INDIA_BOUNDS.minLat && lat <= INDIA_BOUNDS.maxLat && lng >= INDIA_BOUNDS.minLng && lng <= INDIA_BOUNDS.maxLng;
}

/**
 * Central India validation. Every geocoder result must pass this before it is
 * returned to the UI or used for nearby search. We do not accept a foreign
 * location just because the place name matches an Indian query.
 */
export function validateIndiaLocation(place, { requireCoordinates = true } = {}) {
  if (!place) return { ok: false, reason: 'missing' };
  const lat = Number(place.coordinates?.lat ?? place.lat);
  const lng = Number(place.coordinates?.lng ?? place.lng);
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

  if (requireCoordinates && !hasCoordinates) return { ok: false, reason: 'invalid_coordinates' };
  if (hasCoordinates && !isValidCoordinate(lat, lng)) return { ok: false, reason: 'invalid_coordinates' };

  const countryCode = String(place.countryCode || place.country_code || place.address?.country_code || '')
    .trim()
    .toLowerCase();
  const country = String(place.country || place.address?.country || '').trim().toLowerCase();

  if (countryCode && countryCode !== 'in') return { ok: false, reason: 'outside_india' };
  if (country && country !== 'india' && country !== 'bharat') return { ok: false, reason: 'outside_india' };
  if (!countryCode && !country) {
    // No country metadata is ambiguous; only accept if coordinates are clearly inside India.
    if (!hasCoordinates || !isWithinIndiaBounds(lat, lng)) return { ok: false, reason: 'ambiguous_country' };
  }

  if (hasCoordinates && !isWithinIndiaBounds(lat, lng)) {
    return { ok: false, reason: 'outside_india_bounds' };
  }

  return {
    ok: true,
    countryCode: 'IN',
    country: 'India',
    coordinates: hasCoordinates ? { lat, lng } : null,
  };
}

export function normaliseText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function toGeoJsonPoint(lat, lng) {
  return { type: 'Point', coordinates: [lng, lat] };
}

export function fromGeoJsonPoint(point) {
  if (!point || point.type !== 'Point' || !Array.isArray(point.coordinates)) return null;
  const [lng, lat] = point.coordinates;
  return isValidCoordinate(lat, lng) ? { lat, lng } : null;
}

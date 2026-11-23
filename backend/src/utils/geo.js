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

export function normaliseText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

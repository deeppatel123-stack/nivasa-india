const EARTH_RADIUS_KM = 6371;
/** Great-circle distance in kilometres. */
export function haversineKm(a, b) {
    const toRad = (value) => (value * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}
export function formatDistance(km) {
    if (km < 1)
        return `${Math.max(50, Math.round(km * 1000 / 50) * 50)} m`;
    return `${km.toFixed(1)} km`;
}
export function estimateWalkMinutes(km) {
    return Math.max(1, Math.round(km / 0.075));
}

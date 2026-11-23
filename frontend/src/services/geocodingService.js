import { apiFetch } from './api';

export const geocodingService = {
  async suggest(query, signal) {
    if (!query || query.trim().length < 2) return { items: [], available: true };
    const params = new URLSearchParams({ q: query.trim() });
    return apiFetch(`/geocode/suggest?${params}`, { signal });
  },

  async resolve(query, signal) {
    const params = new URLSearchParams({ q: query.trim() });
    return apiFetch(`/geocode/resolve?${params}`, { signal });
  },

  async reverse(lat, lng, signal) {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
    return apiFetch(`/geocode/reverse?${params}`, { signal });
  },

  async status(signal) {
    return apiFetch('/geocode/status', { signal });
  },
};

/** Converts a backend place into the shape used by the search store. */
export function toResolvedLocation(place) {
  if (!place?.coordinates) return null;
  return {
    id: place.id || '',
    name: place.name || '',
    label: place.label || 'Selected location',
    city: place.city || '',
    state: place.state || '',
    coordinates: place.coordinates,
    provider: place.provider || '',
    sourceUrl: place.sourceUrl || '',
    rawQuery: place.rawQuery || '',
  };
}

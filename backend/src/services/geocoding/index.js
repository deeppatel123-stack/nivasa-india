import { env } from '../../config/env.js';
import { getCached, setCached } from '../cacheService.js';
import { unavailable } from '../../utils/errors.js';
import { nominatimReverse, nominatimSearch, photonSuggest } from './providers.js';

export async function suggestPlaces(query, limit = 6) {
  const trimmed = String(query || '').trim();
  if (trimmed.length < 2) return { items: [], provider: 'photon', available: true };

  const key = `suggest:${trimmed.toLowerCase()}:${limit}`;
  const cached = getCached(key);
  if (cached) return { ...cached, cached: true };

  try {
    const items = await photonSuggest(trimmed, limit);
    const result = { items, provider: 'photon', available: true, cached: false };
    if (items.length) setCached(key, result, env.geocodeCacheTtlMs);
    return result;
  } catch (error) {
    return { items: [], provider: 'photon', available: false, error: error.message };
  }
}

export async function resolvePlace(query) {
  const trimmed = String(query || '').trim();
  if (!trimmed) throw unavailable('A location query is required.');

  const key = `resolve:${trimmed.toLowerCase()}`;
  const cached = getCached(key);
  if (cached) return { ...cached, cached: true };

  try {
    const items = await nominatimSearch(trimmed, { limit: 5 });
    if (items.length) {
      const result = { ...items[0], alternatives: items.slice(1, 5), provider: 'osm_nominatim', cached: false };
      setCached(key, result, env.geocodeCacheTtlMs);
      return result;
    }
  } catch (error) {
    // Photon is a fallback forward geocoder, not an autocomplete source here.
    try {
      const items = await photonSuggest(trimmed, 3);
      if (items.length) {
        return { ...items[0], alternatives: items.slice(1), provider: 'photon', cached: false };
      }
    } catch {
      throw unavailable('Location service is currently unavailable.', { upstream: error.message });
    }
  }

  throw unavailable(`No location found for "${trimmed}". Try a city, locality, landmark or full address.`);
}

export async function reverseGeocode(lat, lng) {
  const key = `reverse:${lat.toFixed(4)}:${lng.toFixed(4)}`;
  const cached = getCached(key);
  if (cached) return cached;
  const result = await nominatimReverse(lat, lng);
  setCached(key, result, env.geocodeCacheTtlMs);
  return result;
}

export const geocoderStatus = () => ({
  configuredProvider: env.geocoderProvider,
  autocomplete: 'photon',
  forward: 'osm_nominatim',
  attribution: '© OpenStreetMap contributors, ODbL 1.0',
  note: 'Requests are proxied, cached and rate-limited by this server.',
});

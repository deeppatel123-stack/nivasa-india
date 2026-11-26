import { env } from '../../config/env.js';
import { getCached, setCached } from '../cacheService.js';
import { badRequest, unavailable } from '../../utils/errors.js';
import { isWithinIndiaBounds, normaliseText, validateIndiaLocation } from '../../utils/geo.js';
import { nominatimReverse, nominatimSearch, photonSuggest } from './providers.js';

function indiaOnlyMessage(query) {
  return `No India location found for "${query}". Nivasa supports locations within India only. Try a city, locality, landmark, PIN code or full Indian address.`;
}

function normalisePlace(place) {
  const validation = validateIndiaLocation(place);
  if (!validation.ok) return null;
  return {
    ...place,
    country: 'India',
    countryCode: 'IN',
    coordinates: validation.coordinates,
  };
}

export async function suggestPlaces(query, limit = 6) {
  const trimmed = String(query || '').trim();
  if (trimmed.length < 2) return { items: [], provider: 'photon', available: true, indiaOnly: true };

  const key = `suggest:in:${trimmed.toLowerCase()}:${limit}`;
  const cached = getCached(key);
  if (cached) return { ...cached, cached: true };

  try {
    const raw = await photonSuggest(trimmed, limit);
    const items = raw.map(normalisePlace).filter(Boolean).slice(0, limit);
    const result = {
      items,
      provider: 'photon',
      available: true,
      cached: false,
      indiaOnly: true,
      message: items.length ? undefined : indiaOnlyMessage(trimmed),
    };
    if (items.length) setCached(key, result, env.geocodeCacheTtlMs);
    return result;
  } catch (error) {
    return {
      items: [],
      provider: 'photon',
      available: false,
      indiaOnly: true,
      error: error.message,
      message: 'Location suggestions are temporarily unavailable. Please try again.',
    };
  }
}

function isAmbiguous(query, items) {
  if (items.length < 2) return false;
  const q = normaliseText(query);
  const first = normaliseText(items[0].name || items[0].label);
  const topMatches = items.filter((item) => {
    const name = normaliseText(item.name || item.label);
    return name === q || name.startsWith(q) || q.startsWith(name);
  });
  // If multiple distinct states/cities match equally well, require user selection.
  const distinct = new Set(topMatches.map((i) => `${normaliseText(i.city)}|${normaliseText(i.state)}|${normaliseText(i.postcode)}`));
  if (distinct.size > 1) return true;
  // If top result does not clearly match a short/ambiguous query, require selection.
  if (q.length <= 4 && !first.startsWith(q)) return true;
  return false;
}

export async function resolvePlace(query) {
  const trimmed = String(query || '').trim();
  if (!trimmed) throw badRequest('A location query is required.');

  const key = `resolve:in:${trimmed.toLowerCase()}`;
  const cached = getCached(key);
  if (cached) return { ...cached, cached: true };

  let upstreamError = null;
  const tryResolve = async (fn, provider) => {
    const items = (await fn()).map(normalisePlace).filter(Boolean);
    if (!items.length) return null;
    const ambiguous = isAmbiguous(trimmed, items);
    return {
      ...items[0],
      alternatives: items.slice(1, 5),
      items: items.slice(0, 5),
      ambiguous,
      requiresSelection: ambiguous,
      provider,
      cached: false,
      indiaOnly: true,
      message: ambiguous ? `Multiple Indian locations match "${trimmed}". Please select the correct one.` : undefined,
    };
  };

  try {
    const result = await tryResolve(() => nominatimSearch(trimmed, { limit: 5 }), 'osm_nominatim');
    if (result) {
      if (result.ambiguous) throw badRequest(result.message, { indiaOnly: true, query: trimmed, alternatives: result.items, ambiguous: true });
      setCached(key, result, env.geocodeCacheTtlMs);
      return result;
    }
  } catch (error) {
    if (error?.status === 400 && error?.details?.ambiguous) throw error;
    upstreamError = error;
  }

  try {
    const result = await tryResolve(() => photonSuggest(trimmed, 5), 'photon');
    if (result) {
      if (result.ambiguous) throw badRequest(result.message, { indiaOnly: true, query: trimmed, alternatives: result.items, ambiguous: true });
      setCached(key, result, env.geocodeCacheTtlMs);
      return result;
    }
  } catch (error) {
    if (error?.status === 400 && error?.details?.ambiguous) throw error;
    if (!upstreamError) upstreamError = error;
  }

  if (upstreamError) {
    throw unavailable('Location service is currently unavailable. Please try again.', { upstream: upstreamError.message });
  }
  throw badRequest(indiaOnlyMessage(trimmed), { indiaOnly: true, query: trimmed });
}

export async function reverseGeocode(lat, lng) {
  if (!isWithinIndiaBounds(lat, lng)) {
    throw badRequest('Nivasa currently supports locations within India only.');
  }
  const key = `reverse:in:${lat.toFixed(4)}:${lng.toFixed(4)}`;
  const cached = getCached(key);
  if (cached) return cached;
  const result = normalisePlace(await nominatimReverse(lat, lng));
  if (!result) {
    throw badRequest('The selected coordinates are outside supported Indian locations.');
  }
  setCached(key, result, env.geocodeCacheTtlMs);
  return result;
}

export const geocoderStatus = () => ({
  configuredProvider: env.geocoderProvider,
  autocomplete: 'photon',
  forward: 'osm_nominatim',
  countryRestriction: 'IN',
  indiaOnly: true,
  attribution: '© OpenStreetMap contributors, ODbL 1.0',
  note: 'Requests are proxied, cached, rate-limited and validated to Indian locations by this server.',
});

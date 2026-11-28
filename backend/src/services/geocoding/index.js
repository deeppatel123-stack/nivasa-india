import { env } from '../../config/env.js';
import { getCached, setCached } from '../cacheService.js';
import { badRequest, unavailable } from '../../utils/errors.js';
import { isWithinIndiaBounds, normaliseText, validateIndiaLocation } from '../../utils/geo.js';
import { nominatimReverse, nominatimSearch, photonSuggest } from './providers.js';
import { googleGeocode, googleStatus, googleTextSearch } from './googlePlaces.js';

// Extensible alias rules. Add city/context-aware expansions; avoid resolving ambiguous short queries without context.
const ALIASES = [
  { pattern: /\blj\s*(university|uni|inst|institute)?\b/i, expansions: ['LJ University Ahmedabad', 'LJ Institute Ahmedabad', 'LJ Campus Ahmedabad'] },
  { pattern: /\bnirma\s*(university|uni|inst|institute)?\b/i, expansions: ['Nirma University Ahmedabad'] },
  { pattern: /\bs\.?\s*g\.?\s*highway\b/i, expansions: ['SG Highway Ahmedabad', 'Sarkhej Gandhinagar Highway Ahmedabad'] },
  { pattern: /\bmakarba\b/i, expansions: ['Makarba Ahmedabad', 'Makarba, Ahmedabad, Gujarat'] },
  { pattern: /\bvastrapur\b/i, expansions: ['Vastrapur Ahmedabad', 'Vastrapur Lake Ahmedabad'] },
  { pattern: /\bhinjewadi\b/i, expansions: ['Hinjewadi Pune', 'Hinjewadi Phase 1 Pune', 'Rajiv Gandhi Infotech Park Hinjewadi'] },
  { pattern: /\bpowai\b/i, expansions: ['Powai Mumbai', 'Powai, Mumbai, Maharashtra'] },
  { pattern: /\bkoramangala\b/i, expansions: ['Koramangala Bengaluru', 'Koramangala Bangalore Karnataka'] },
  { pattern: /\bhsr\b/i, expansions: ['HSR Layout Bengaluru', 'HSR Layout Bangalore'] },
  { pattern: /\bbtm\b/i, expansions: ['BTM Layout Bengaluru', 'BTM Layout Bangalore'] },
  { pattern: /\belectronic city\b|\becity\b/i, expansions: ['Electronic City Bengaluru', 'Electronic City Bangalore'] },
  { pattern: /\bwhitefield\b/i, expansions: ['Whitefield Bengaluru', 'Whitefield Bangalore'] },
  { pattern: /\bmarathahalli\b/i, expansions: ['Marathahalli Bengaluru'] },
  { pattern: /\bandheri\b/i, expansions: ['Andheri Mumbai'] },
  { pattern: /\bbandra\b/i, expansions: ['Bandra Mumbai'] },
  { pattern: /\bgachibowli\b/i, expansions: ['Gachibowli Hyderabad'] },
  { pattern: /\bnoida\b/i, expansions: ['Noida Uttar Pradesh'] },
  { pattern: /\bgurgaon\b|\bgurugram\b/i, expansions: ['Gurugram Haryana', 'Gurgaon Haryana'] },
  { pattern: /\bsurat\b/i, expansions: ['Surat Gujarat'] },
  { pattern: /\bjamnagar\b/i, expansions: ['Jamnagar Gujarat'] },
  { pattern: /\bahmedabad\b|\bamdavad\b/i, expansions: ['Ahmedabad Gujarat'] },
  { pattern: /\bbengaluru\b|\bbangalore\b|\bblr\b/i, expansions: ['Bengaluru Karnataka', 'Bangalore Karnataka'] },
  { pattern: /\bmumbai\b|\bbombay\b/i, expansions: ['Mumbai Maharashtra'] },
  { pattern: /\bpune\b/i, expansions: ['Pune Maharashtra'] },
];

function indiaOnlyMessage(query) {
  return `No India location found for "${query}". Nivasa supports locations within India only. Try a city, locality, landmark, college, company, PIN code or full Indian address.`;
}

function normalizeAliasText(value) {
  return normaliseText(String(value || '').replace(/[.]/g, ' ').replace(/\s+/g, ' '));
}

function hasCityContext(value) {
  return /\b(ahmedabad|amdavad|gujarat|pune|maharashtra|mumbai|bombay|bengaluru|bangalore|karnataka|surat|jamnagar|delhi|noida|gurugram|gurgaon|hyderabad|chennai|kolkata|jaipur|indore|bhopal)\b/i.test(value);
}

function expandQuery(query) {
  const trimmed = String(query || '').trim();
  const normalized = normalizeAliasText(trimmed);
  const expansions = new Set([trimmed]);
  for (const alias of ALIASES) {
    if (alias.pattern.test(trimmed) || alias.pattern.test(normalized)) {
      alias.expansions.forEach((value) => {
        // Avoid expanding very short ambiguous tokens unless query already has context.
        const shortToken = normalized.length <= 3 && !hasCityContext(normalized);
        if (shortToken && !hasCityContext(value)) return;
        expansions.add(value);
      });
    }
  }
  // Common punctuation/spacing variants
  if (/\bs\s*\.?\s*g\s*\.?\s*highway\b/i.test(trimmed)) expansions.add('SG Highway Ahmedabad');
  if (/\bl\s*\.?\s*j\s*\.?\s*(university|institute)?\b/i.test(trimmed)) expansions.add('LJ University Ahmedabad');
  return Array.from(expansions).filter(Boolean).slice(0, 6);
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

function dedupePlaces(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.placeId || item.id || `${item.coordinates?.lat?.toFixed?.(5)},${item.coordinates?.lng?.toFixed?.(5)}|${normaliseText(item.label)}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function suggestPlaces(query, limit = 6) {
  const trimmed = String(query || '').trim();
  if (trimmed.length < 2) {
    return { items: [], provider: 'none', available: true, indiaOnly: true, diagnostics: { query: trimmed } };
  }

  const key = `suggest:v2:${env.geocoderProvider}:${trimmed.toLowerCase()}:${limit}`;
  const cached = getCached(key);
  if (cached) return { ...cached, cached: true };

  const diagnostics = { query: trimmed, providers: [], expandedQueries: expandQuery(trimmed) };
  const providers = [];

  // Prefer Google Places Text Search when key is configured; fall back to Photon/Nominatim.
  if (env.googleMapsKey) {
    providers.push({
      name: 'google_places',
      run: async () => {
        const expanded = expandQuery(trimmed);
        const results = [];
        for (const q of expanded) {
          results.push(...await googleTextSearch(q, { limit }));
        }
        return dedupePlaces(results).slice(0, limit);
      },
    });
  }
  providers.push({ name: 'photon', run: () => photonSuggest(trimmed, limit) });
  providers.push({ name: 'osm_nominatim', run: () => nominatimSearch(trimmed, { limit }) });

  for (const provider of providers) {
    const entry = { provider: provider.name, status: 'ok', count: 0 };
    try {
      const raw = await provider.run();
      const items = dedupePlaces(raw.map(normalisePlace).filter(Boolean)).slice(0, limit);
      entry.count = items.length;
      diagnostics.providers.push(entry);
      if (items.length) {
        const result = {
          items,
          provider: provider.name,
          available: true,
          cached: false,
          indiaOnly: true,
          diagnostics,
        };
        setCached(key, result, env.geocodeCacheTtlMs);
        return result;
      }
    } catch (error) {
      entry.status = error.code === 'missing_google_api_key' ? 'missing_credentials' : 'error';
      entry.error = error.message;
      diagnostics.providers.push(entry);
    }
  }

  const hasAvailable = diagnostics.providers.some((p) => p.status === 'ok');
  return {
    items: [],
    provider: diagnostics.providers[0]?.provider || 'unknown',
    available: hasAvailable,
    cached: false,
    indiaOnly: true,
    diagnostics,
    message: hasAvailable ? indiaOnlyMessage(trimmed) : 'Location suggestions are temporarily unavailable. Please try again.',
  };
}

function locationKey(item) {
  return [normaliseText(item.city), normaliseText(item.state), normaliseText(item.postcode), normaliseText(item.name || item.label)].join('|');
}

function isAmbiguous(query, items) {
  if (items.length < 2) return false;
  const q = normalizeAliasText(query);
  const normalizedItems = items.map((item) => ({
    item,
    name: normalizeAliasText(item.name || item.label),
    city: normalizeAliasText(item.city),
    state: normalizeAliasText(item.state),
  }));

  const strongMatches = normalizedItems.filter(({ name, city, state }) =>
    name === q || name.startsWith(q) || q.startsWith(name) || city === q || `${name} ${city}`.includes(q)
  );
  const candidates = strongMatches.length > 1 ? strongMatches : normalizedItems.slice(0, 3);
  const distinct = new Set(candidates.map(({ item }) => `${normaliseText(item.city)}|${normaliseText(item.state)}|${normaliseText(item.postcode)}`));

  // Same name in different cities/states: ambiguous.
  if (distinct.size > 1) {
    // If query already includes a disambiguating context that matches only one candidate, allow it.
    const contextual = candidates.filter(({ name, city, state }) => q.includes(city) || q.includes(state) || q.includes(name));
    const contextualDistinct = new Set(contextual.map(({ item }) => `${normaliseText(item.city)}|${normaliseText(item.state)}`));
    if (contextualDistinct.size === 1) return false;
    return true;
  }

  // Very short query without context can be ambiguous.
  if (q.length <= 3 && !hasCityContext(q)) return true;

  return false;
}

export async function resolvePlace(query) {
  const trimmed = String(query || '').trim();
  if (!trimmed) throw badRequest('A location query is required.');

  const key = `resolve:v2:${env.geocoderProvider}:${trimmed.toLowerCase()}`;
  const cached = getCached(key);
  if (cached) return { ...cached, cached: true };

  const diagnostics = { query: trimmed, expandedQueries: expandQuery(trimmed), providers: [] };
  const providers = [];
  const expanded = expandQuery(trimmed);

  if (env.googleMapsKey) {
    providers.push({
      name: 'google_places',
      run: async () => {
        const items = [];
        for (const q of expanded) items.push(...await googleTextSearch(q, { limit: 5 }));
        return items;
      },
    });
    providers.push({
      name: 'google_geocode',
      run: async () => {
        const items = [];
        for (const q of expanded) items.push(...await googleGeocode(q));
        return items;
      },
    });
  }
  providers.push({ name: 'osm_nominatim', run: async () => {
    const items = [];
    for (const q of expanded) items.push(...await nominatimSearch(q, { limit: 5 }));
    return items;
  }});
  providers.push({ name: 'photon', run: async () => {
    const items = [];
    for (const q of expanded) items.push(...await photonSuggest(q, 5));
    return items;
  }});

  let upstreamError = null;
  for (const provider of providers) {
    const entry = { provider: provider.name, status: 'ok', count: 0 };
    try {
      const raw = await provider.run();
      const items = dedupePlaces(raw.map(normalisePlace).filter(Boolean)).slice(0, 5);
      entry.count = items.length;
      diagnostics.providers.push(entry);
      if (!items.length) continue;
      const ambiguous = isAmbiguous(trimmed, items);
      const result = {
        ...items[0],
        alternatives: items.slice(1, 5),
        items: items.slice(0, 5),
        ambiguous,
        requiresSelection: ambiguous,
        provider: provider.name,
        cached: false,
        indiaOnly: true,
        diagnostics,
        message: ambiguous ? `Multiple Indian locations match "${trimmed}". Please select the correct one.` : undefined,
      };
      if (ambiguous) {
        throw badRequest(result.message, { indiaOnly: true, query: trimmed, alternatives: result.items, ambiguous: true, diagnostics });
      }
      setCached(key, result, env.geocodeCacheTtlMs);
      return result;
    } catch (error) {
      if (error?.status === 400 && error?.details?.ambiguous) throw error;
      entry.status = error.code === 'missing_google_api_key' ? 'missing_credentials' : 'error';
      entry.error = error.message;
      if (!diagnostics.providers.includes(entry)) diagnostics.providers.push(entry);
      upstreamError = upstreamError || error;
    }
  }

  if (diagnostics.providers.length && diagnostics.providers.every((p) => p.status !== 'ok')) {
    throw unavailable('Location service is currently unavailable. Please try again.', { upstream: upstreamError?.message, diagnostics });
  }
  throw badRequest(indiaOnlyMessage(trimmed), { indiaOnly: true, query: trimmed, diagnostics, reason: 'location_not_found' });
}

export async function reverseGeocode(lat, lng) {
  if (!isWithinIndiaBounds(lat, lng)) {
    throw badRequest('Nivasa currently supports locations within India only.');
  }
  const key = `reverse:v2:${lat.toFixed(4)}:${lng.toFixed(4)}`;
  const cached = getCached(key);
  if (cached) return cached;

  const errors = [];
  if (env.googleMapsKey) {
    try {
      const params = new URLSearchParams({ latlng: `${lat},${lng}`, key: env.googleMapsKey, language: 'en' });
      // googleGeocode handles address query; for reverse, call endpoint directly.
      const response = await fetch(`${env.googleGeocodeBaseUrl}/json?${params.toString()}`, { signal: AbortSignal.timeout(10000) });
      const payload = await response.json().catch(() => null);
      if (response.ok && payload?.status === 'OK') {
        const result = normalisePlace(payload.results.map((r) => ({
          id: `google:${r.place_id || `${lat},${lng}`}`,
          placeId: r.place_id || '',
          name: r.formatted_address?.split(',')[0] || '',
          label: r.formatted_address || '',
          formattedAddress: r.formatted_address || '',
          city: (r.address_components || []).find((c) => c.types?.includes('locality'))?.long_name || '',
          state: (r.address_components || []).find((c) => c.types?.includes('administrative_area_level_1'))?.long_name || '',
          country: (r.address_components || []).find((c) => c.types?.includes('country'))?.long_name || '',
          countryCode: ((r.address_components || []).find((c) => c.types?.includes('country'))?.short_name || '').toLowerCase(),
          postcode: (r.address_components || []).find((c) => c.types?.includes('postal_code'))?.long_name || '',
          coordinates: { lat, lng },
          provider: 'google_geocode',
          sourceUrl: r.place_id ? `https://www.google.com/maps/place/?q=place_id:${r.place_id}` : '',
        })).find(Boolean));
        if (result) { setCached(key, result, env.geocodeCacheTtlMs); return result; }
      } else if (payload?.status && payload.status !== 'ZERO_RESULTS') {
        errors.push(`google_geocode:${payload.status}`);
      }
    } catch (error) {
      errors.push(`google_geocode:${error.message}`);
    }
  }

  try {
    const result = normalisePlace(await nominatimReverse(lat, lng));
    if (!result) throw badRequest('The selected coordinates are outside supported Indian locations.');
    setCached(key, result, env.geocodeCacheTtlMs);
    return result;
  } catch (error) {
    if (error?.status === 400) throw error;
    errors.push(`osm_nominatim:${error.message}`);
  }

  throw unavailable('Reverse geocoding is currently unavailable. Please try again.', { errors });
}

export const geocoderStatus = () => ({
  configuredProvider: env.geocoderProvider,
  google: googleStatus(),
  autocomplete: env.googleMapsKey ? 'google_places_text_search|photon|osm_nominatim' : 'photon|osm_nominatim',
  forward: env.googleMapsKey ? 'google_places_text_search|google_geocode|osm_nominatim|photon' : 'osm_nominatim|photon',
  reverse: env.googleMapsKey ? 'google_geocode|osm_nominatim' : 'osm_nominatim',
  countryRestriction: 'IN',
  indiaOnly: true,
  attribution: '© OpenStreetMap contributors, ODbL 1.0; Google data shown only when Google APIs are configured and used.',
  note: 'Requests are proxied, cached, rate-limited and validated to Indian locations by this server. Set GOOGLE_MAPS_API_KEY to enable Google Places/Geocoding.',
});

export const __test__ = { expandQuery, normalizeAliasText, isAmbiguous };

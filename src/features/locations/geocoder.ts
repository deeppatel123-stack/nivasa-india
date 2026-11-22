import { DEMO_PLACES } from './demoLocations';
import type { Place, ResolvedLocation } from './types';

/**
 * Provider boundary for location resolution. A real geocoding API (Google,
 * Mapbox, Photon, etc.) can implement this interface without touching pages.
 */
export interface Geocoder {
  readonly name: string;
  suggest(query: string, limit?: number): Place[];
  resolve(query: string): ResolvedLocation;
}

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s,]/g, ' ').replace(/\s+/g, ' ').trim();
}

function score(place: Place, query: string): number {
  const q = normalise(query);
  const name = normalise(place.name);
  const city = normalise(place.city);
  const aliases = (place.aliases ?? []).map(normalise);
  if (name === q || aliases.includes(q)) return 100;
  if (name.startsWith(q)) return 80;
  if (aliases.some((alias) => alias.startsWith(q))) return 75;
  if (name.includes(q)) return 60;
  if (aliases.some((alias) => q.includes(alias) || alias.includes(q))) return 55;
  if (`${name} ${city}`.includes(q)) return 40;
  return 0;
}

export const demoGeocoder: Geocoder = {
  name: 'Curated India location index (demo)',
  suggest(query, limit = 8) {
    const q = normalise(query);
    if (!q) return [];
    return DEMO_PLACES.map((place) => ({ place, rank: score(place, q) }))
      .filter((entry) => entry.rank > 0)
      .sort((a, b) => b.rank - a.rank || a.place.name.localeCompare(b.place.name))
      .slice(0, limit)
      .map((entry) => entry.place);
  },
  resolve(query) {
    const trimmed = query.trim();
    if (!trimmed) {
      return { query: trimmed, place: null, coordinates: null, unresolved: false, source: 'none' };
    }
    const suggestions = this.suggest(trimmed, 1);
    const place = suggestions[0] ?? null;
    return {
      query: trimmed,
      place,
      coordinates: place?.coordinates ?? null,
      unresolved: !place,
      source: place ? 'index' : 'none',
    };
  },
};

/** Placeholder for a future network geocoder. */
export const createRemoteGeocoder = (baseUrl: string): Geocoder => ({
  name: `Remote geocoder (${baseUrl})`,
  suggest: () => [],
  resolve: (query) => ({ query, place: null, coordinates: null, unresolved: true, source: 'none' }),
});

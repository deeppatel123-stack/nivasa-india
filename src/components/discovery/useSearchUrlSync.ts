import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CATEGORY_LABELS, type PropertyCategory } from '@/features/listings/types';
import { demoGeocoder } from '@/features/locations/geocoder';
import type { RadiusKm } from '@/features/search/types';
import { useSearchStore } from '@/store/useSearchStore';

const VALID_CATEGORIES = new Set<string>(Object.keys(CATEGORY_LABELS));

function parseRadius(value: string | null): RadiusKm | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? (parsed as RadiusKm) : null;
}

/**
 * Applies shareable URL state (`q`, `radius`, `category`) to the persisted search store.
 * Writes stay in the pages so each route can choose whether to keep its pathname.
 */
export function useSearchUrlSync(): void {
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get('q');
  const radiusParam = searchParams.get('radius');
  const categoryParam = searchParams.get('category');

  useEffect(() => {
    const store = useSearchStore.getState();
    const query = (qParam ?? '').trim();

    if (query !== store.query) {
      // A matching GPS query is set by LocationSearchBar and carries coordinates
      // that cannot be expressed in the URL, so it must not be re-resolved here.
      store.setQuery(query);
      store.setResolvedLocation(query ? demoGeocoder.resolve(query) : null);
    }

    const radius = parseRadius(radiusParam);
    if (radius !== null && radius !== store.radiusKm) {
      store.setRadius(radius);
    }
  }, [qParam, radiusParam]);

  useEffect(() => {
    if (categoryParam === null) return;
    const categories = categoryParam
      .split(',')
      .map((value) => value.trim())
      .filter((value): value is PropertyCategory => VALID_CATEGORIES.has(value));
    if (!categories.length) return;

    const current = useSearchStore.getState().filters.categories;
    if (categories.join(',') !== current.join(',')) {
      useSearchStore.getState().patchFilters({ categories });
    }
  }, [categoryParam]);
}

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CATEGORY_LABELS } from '@/features/listings/types';
import { geocodingService, toResolvedLocation } from '@/services/geocodingService';
import { useSearchStore } from '@/store/useSearchStore';

const VALID_CATEGORIES = new Set(Object.keys(CATEGORY_LABELS));
const VALID_RADII = new Set([0.5, 1, 2, 5, 10, 20, 50]);

/** Apply shareable URL state to the store. Coordinates in the URL are authoritative. */
export function useSearchUrlSync() {
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get('q');
  const radiusParam = searchParams.get('radius');
  const categoryParam = searchParams.get('category');
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const lastResolved = useRef('');

  useEffect(() => {
    const store = useSearchStore.getState();
    const query = (qParam ?? '').trim();
    if (query !== store.query) store.setQuery(query);

    const radius = Number(radiusParam);
    if (VALID_RADII.has(radius) && radius !== store.radiusKm) store.setRadius(radius);

    const lat = Number(latParam);
    const lng = Number(lngParam);
    if (Number.isFinite(lat) && Number.isFinite(lng) && latParam !== null && lngParam !== null) {
      store.setResolvedLocation({
        query,
        label: query || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        coordinates: { lat, lng },
        source: latParam === 'gps' ? 'gps' : 'url',
      });
      lastResolved.current = `${lat},${lng}`;
      return;
    }

    if (!query) {
      store.setResolvedLocation(null);
      lastResolved.current = '';
      return;
    }

    if (store.resolvedLocation?.rawQuery === query || lastResolved.current === query) return;
    lastResolved.current = query;
    const controller = new AbortController();
    geocodingService
      .resolve(query, controller.signal)
      .then((place) => {
        const resolved = toResolvedLocation(place);
        useSearchStore.getState().setResolvedLocation({ ...resolved, rawQuery: query, query });
      })
      .catch(() => {
        useSearchStore.getState().setResolvedLocation(null);
      });
    return () => controller.abort();
  }, [qParam, radiusParam, latParam, lngParam]);

  useEffect(() => {
    if (categoryParam === null) return;
    const categories = categoryParam
      .split(',')
      .map((value) => value.trim())
      .filter((value) => VALID_CATEGORIES.has(value));
    if (!categories.length) return;
    const current = useSearchStore.getState().filters.categories;
    if (categories.join(',') !== current.join(',')) {
      useSearchStore.getState().patchFilters({ categories });
    }
  }, [categoryParam]);
}

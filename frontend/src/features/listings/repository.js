import { apiFetch } from '@/services/api';
import { listCachedListings, rememberListing, rememberListings } from './listingCache';
import { normaliseListing } from './normalize';

/**
 * Genuine-data repository. There is no demo fallback: if the API is down or a
 * provider is unavailable, callers receive an error and render an honest empty
 * or error state.
 */
export const listingRepository = {
  mode: 'genuine-api',

  /** Locally known records, used by saved/compare/recent pages. */
  list() {
    return listCachedListings();
  },

  async search(params = {}, signal) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
      else query.set(key, String(value));
    });
    const payload = await apiFetch(`/listings?${query.toString()}`, { signal });
    const items = (payload.items || []).map(normaliseListing).filter(Boolean);
    rememberListings(items);
    return { items, meta: payload.meta || {} };
  },

  async getById(id, signal) {
    try {
      const record = await apiFetch(`/listings/${encodeURIComponent(id)}`, { signal });
      const listing = normaliseListing(record);
      if (listing) rememberListing(listing);
      return listing;
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  },

  async submit(body, signal) {
    return apiFetch('/submissions', {
      method: 'POST',
      body: JSON.stringify(body),
      signal,
    });
  },

  async mySubmissions(signal) {
    const payload = await apiFetch('/submissions', { signal });
    return (payload.items || []).map(normaliseListing).filter(Boolean);
  },
};

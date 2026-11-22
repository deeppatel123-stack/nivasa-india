import { DEMO_LISTINGS } from './demoListings';

const configuredBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export const demoListingRepository = {
  mode: 'demo',
  async list() {
    return DEMO_LISTINGS;
  },
  async getById(id) {
    return DEMO_LISTINGS.find((listing) => listing.id === id) ?? null;
  },
};

/** Talks to the Express API. Responses are always labelled demo records. */
export function createRemoteListingRepository(baseUrl) {
  const root = baseUrl.replace(/\/$/, '');
  return {
    mode: 'remote',
    async list() {
      const response = await fetch(`${root}/listings`);
      if (!response.ok) throw new Error('Unable to load listings');
      const payload = await response.json();
      return Array.isArray(payload) ? payload : payload.listings ?? [];
    },
    async getById(id) {
      const response = await fetch(`${root}/listings/${encodeURIComponent(id)}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Unable to load listing');
      return response.json();
    },
  };
}

const remoteListingRepository = createRemoteListingRepository(configuredBase);

/**
 * Default repository: use the MERN API when it is running, and fall back to
 * the identical in-memory demo dataset when it is not. The UI never invents
 * data in either mode.
 */
export const listingRepository = {
  mode: 'remote-with-demo-fallback',
  async list() {
    try {
      return await remoteListingRepository.list();
    } catch {
      return DEMO_LISTINGS;
    }
  },
  async getById(id) {
    try {
      return await remoteListingRepository.getById(id);
    } catch {
      return demoListingRepository.getById(id);
    }
  },
};

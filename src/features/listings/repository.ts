import { DEMO_LISTINGS } from './demoListings';
import type { Property } from './types';

export interface ListingRepository {
  readonly mode: 'demo' | 'remote';
  list(): Promise<Property[]>;
  getById(id: string): Promise<Property | null>;
}

export const demoListingRepository: ListingRepository = {
  mode: 'demo',
  async list() {
    return DEMO_LISTINGS;
  },
  async getById(id) {
    return DEMO_LISTINGS.find((listing) => listing.id === id) ?? null;
  },
};

/** Backend hook for phase two. Keeps page code independent of data origin. */
export function createRemoteListingRepository(baseUrl: string): ListingRepository {
  return {
    mode: 'remote',
    async list() {
      const response = await fetch(`${baseUrl}/listings`);
      if (!response.ok) throw new Error('Unable to load listings');
      return (await response.json()) as Property[];
    },
    async getById(id) {
      const response = await fetch(`${baseUrl}/listings/${encodeURIComponent(id)}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Unable to load listing');
      return (await response.json()) as Property;
    },
  };
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { rememberListing } from '@/features/listings/listingCache';

export const useRecentlyViewedStore = create()(persist((set) => ({
  ids: [],
  items: {},
  add: (id, property) => {
    if (property) rememberListing(property);
    return set((state) => ({
      ids: [id, ...state.ids.filter((item) => item !== id)].slice(0, 12),
      items: property ? { ...state.items, [id]: property } : state.items,
    }));
  },
  clear: () => set({ ids: [], items: {} }),
}), { name: 'nivasa.recently-viewed' }));

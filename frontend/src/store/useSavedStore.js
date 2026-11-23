import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { rememberListing } from '@/features/listings/listingCache';

export const useSavedStore = create()(persist((set) => ({
  ids: [],
  items: {},
  toggle: (id, property) => {
    if (property) rememberListing(property);
    return set((state) => {
      const exists = state.ids.includes(id);
      const items = { ...state.items };
      if (exists) delete items[id];
      else if (property) items[id] = property;
      return {
        ids: exists ? state.ids.filter((item) => item !== id) : [...state.ids, id],
        items,
      };
    });
  },
  remove: (id) => set((state) => {
    const items = { ...state.items };
    delete items[id];
    return { ids: state.ids.filter((item) => item !== id), items };
  }),
  clear: () => set({ ids: [], items: {} }),
}), { name: 'nivasa.saved' }));

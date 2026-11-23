import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { rememberListing } from '@/features/listings/listingCache';

export const MAX_COMPARE = 4;

export const useCompareStore = create()(persist((set) => ({
  ids: [],
  items: {},
  toggle: (id, property) => {
    if (property) rememberListing(property);
    let added = false;
    set((state) => {
      if (state.ids.includes(id)) {
        const items = { ...state.items };
        delete items[id];
        return { ids: state.ids.filter((item) => item !== id), items };
      }
      if (state.ids.length >= MAX_COMPARE) return state;
      added = true;
      return { ids: [...state.ids, id], items: property ? { ...state.items, [id]: property } : state.items };
    });
    return added;
  },
  remove: (id) => set((state) => {
    const items = { ...state.items };
    delete items[id];
    return { ids: state.ids.filter((item) => item !== id), items };
  }),
  clear: () => set({ ids: [], items: {} }),
}), { name: 'nivasa.compare' }));

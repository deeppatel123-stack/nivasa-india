import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentlyViewedStore {
  ids: string[];
  add: (id: string) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      ids: [],
      add: (id) =>
        set((state) => ({ ids: [id, ...state.ids.filter((item) => item !== id)].slice(0, 12) })),
      clear: () => set({ ids: [] }),
    }),
    { name: 'nivasa.recently-viewed' },
  ),
);

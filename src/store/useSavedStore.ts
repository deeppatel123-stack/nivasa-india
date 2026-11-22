import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SavedStore {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useSavedStore = create<SavedStore>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((state) => ({ ids: state.ids.includes(id) ? state.ids.filter((item) => item !== id) : [...state.ids, id] })),
      remove: (id) => set((state) => ({ ids: state.ids.filter((item) => item !== id) })),
      clear: () => set({ ids: [] }),
    }),
    { name: 'nivasa.saved' },
  ),
);

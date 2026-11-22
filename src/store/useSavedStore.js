import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useSavedStore = create()(persist((set) => ({
    ids: [],
    toggle: (id) => set((state) => ({ ids: state.ids.includes(id) ? state.ids.filter((item) => item !== id) : [...state.ids, id] })),
    remove: (id) => set((state) => ({ ids: state.ids.filter((item) => item !== id) })),
    clear: () => set({ ids: [] }),
}), { name: 'nivasa.saved' }));

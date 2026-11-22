import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const MAX_COMPARE = 4;
export const useCompareStore = create()(persist((set) => ({
    ids: [],
    toggle: (id) => {
        let added = false;
        set((state) => {
            if (state.ids.includes(id))
                return { ids: state.ids.filter((item) => item !== id) };
            if (state.ids.length >= MAX_COMPARE)
                return state;
            added = true;
            return { ids: [...state.ids, id] };
        });
        return added;
    },
    remove: (id) => set((state) => ({ ids: state.ids.filter((item) => item !== id) })),
    clear: () => set({ ids: [] }),
}), { name: 'nivasa.compare' }));

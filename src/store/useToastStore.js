import { create } from 'zustand';
let counter = 0;
export const useToastStore = create((set) => ({
    toasts: [],
    push: (message, tone = 'info') => {
        const id = ++counter;
        set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }));
        window.setTimeout(() => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })), 4200);
    },
    dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

import { create } from 'zustand';

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'info' | 'warning';
}

interface ToastStore {
  toasts: Toast[];
  push: (message: string, tone?: Toast['tone']) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (message, tone = 'info') => {
    const id = ++counter;
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }));
    window.setTimeout(() => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })), 4200);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

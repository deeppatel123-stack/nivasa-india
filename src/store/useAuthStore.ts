import { create } from 'zustand';
import { authService, type AuthResult, type AuthUser } from '@/features/auth/authService';

interface AuthStore {
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  googleSignIn: () => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  signOut: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: authService.getSession(),
  signIn: async (email, password) => {
    const result = await authService.signIn(email, password);
    if (result.ok) set({ user: result.user ?? null });
    return result;
  },
  signUp: async (name, email, password) => {
    const result = await authService.signUp(name, email, password);
    if (result.ok) set({ user: result.user ?? null });
    return result;
  },
  googleSignIn: async () => authService.googleSignIn(),
  requestPasswordReset: (email) => authService.requestPasswordReset(email),
  signOut: () => {
    authService.signOut();
    set({ user: null });
  },
}));

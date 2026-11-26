import { useEffect } from 'react';
import { create } from 'zustand';
import { authService } from '@/features/auth/authService';
import { authToken } from '@/services/authToken';

export const ROLES = ['guest', 'student', 'professional', 'owner', 'admin'];
const ROLE_MAP = { seeker: 'student', landlord: 'owner' };

export function normalizeRole(role) {
  const value = ROLE_MAP[String(role || '').trim().toLowerCase()] || String(role || '').trim().toLowerCase();
  return ROLES.includes(value) ? value : 'guest';
}

export function isSeekerRole(role) {
  const normalized = normalizeRole(role);
  return normalized === 'student' || normalized === 'professional';
}

const cached = authService.getCachedSession();
let verificationInFlight = null;

function errorMessage(error) {
  return error?.message || 'Could not verify this session with the API.';
}

export const useAuthStore = create((set) => ({
  user: cached?.user ? { ...cached.user, role: normalizeRole(cached.user.role) } : null,
  status: 'idle',
  verified: false,
  error: null,

  /** Verify the cached account with GET /auth/me. Safe to call from every mount. */
  verifySession: async () => {
    if (verificationInFlight) return verificationInFlight;

    if (!authToken.get()) {
      authService.signOut();
      set({
        user: null,
        status: 'anonymous',
        verified: true,
        error: null,
      });
      return { ok: false, reason: 'no-token' };
    }

    set({ status: 'verifying', error: null });
    verificationInFlight = (async () => {
      try {
        const result = await authService.fetchSession();
        set({
          user: result.user ? { ...result.user, role: normalizeRole(result.user.role) } : null,
          status: 'authenticated',
          verified: true,
          error: null,
        });
        return result;
      } catch (error) {
        if (error?.status === 401) {
          authService.signOut();
          set({
            user: null,
            status: 'anonymous',
            verified: true,
            error: null,
          });
          return { ok: false, reason: 'unauthorized' };
        }
        const message = errorMessage(error);
        set({ status: 'error', verified: false, error: message });
        return { ok: false, message };
      } finally {
        verificationInFlight = null;
      }
    })();
    return verificationInFlight;
  },

  signIn: async (email, password) => {
    const result = await authService.signIn(email, password);
    if (result.ok) {
      set({
        user: result.user ? { ...result.user, role: normalizeRole(result.user.role) } : null,
        status: 'authenticated',
        verified: true,
        error: null,
      });
    }
    return result;
  },

  signUp: async (name, email, password, role) => {
    const result = await authService.signUp(name, email, password, role);
    if (result.ok) {
      set({
        user: result.user ? { ...result.user, role: normalizeRole(result.user.role) } : null,
        status: 'authenticated',
        verified: true,
        error: null,
      });
    }
    return result;
  },

  requestPasswordReset: (email) => authService.requestPasswordReset(email),

  signOut: () => {
    authService.signOut();
    set({
      user: null,
      status: 'anonymous',
      verified: true,
      error: null,
    });
  },
}));

/** Use in a page component to re-check the session when it mounts. */
export function useAuthVerification() {
  useEffect(() => {
    void useAuthStore.getState().verifySession();
  }, []);
}

// Navbar imports this store on every page load, so this verifies once at startup.
if (typeof window !== 'undefined') {
  void useAuthStore.getState().verifySession();
}

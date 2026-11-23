import { apiFetch } from '@/services/api';
import { authToken } from '@/services/authToken';

const USER_KEY = 'nivasa.auth.user';

function readCachedSession() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const user = parsed.user ?? parsed;
    if (!user || typeof user !== 'object' || (!user.id && !user.email)) return null;
    return {
      user,
      storage: parsed.storage ?? null,
      tokenMode: parsed.tokenMode ?? null,
    };
  } catch {
    return null;
  }
}

function writeCachedSession({ user, storage, tokenMode }) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify({ user, storage, tokenMode }));
  } catch {
    // The API response still drives the in-memory session if storage is unavailable.
  }
}

function clearCachedSession() {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // Signing out always clears the in-memory session and the token.
  }
}

function requireUser(payload) {
  if (!payload || typeof payload !== 'object' || !payload.user) {
    throw new Error('The account endpoint returned an unexpected response.');
  }
  return payload;
}

/** Account calls are made against the Nivasa API; the browser only caches the result. */
export const authService = {
  getSession() {
    return readCachedSession()?.user ?? null;
  },

  getCachedSession() {
    return readCachedSession();
  },

  async signIn(email, password) {
    const payload = requireUser(await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }));
    authToken.set(payload.token);
    writeCachedSession(payload);
    return {
      ok: true,
      user: payload.user,
      storage: payload.storage ?? null,
      tokenMode: payload.tokenMode ?? null,
      message: 'Signed in.',
    };
  },

  async signUp(name, email, password) {
    const payload = requireUser(await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }));
    authToken.set(payload.token);
    writeCachedSession(payload);
    return {
      ok: true,
      user: payload.user,
      storage: payload.storage ?? null,
      tokenMode: payload.tokenMode ?? null,
      message: 'Account created and signed in.',
    };
  },

  async fetchSession() {
    const payload = requireUser(await apiFetch('/auth/me'));
    writeCachedSession(payload);
    return {
      ok: true,
      user: payload.user,
      storage: payload.storage ?? null,
      tokenMode: payload.tokenMode ?? null,
    };
  },

  async requestPasswordReset(email) {
    const body = email ? JSON.stringify({ email }) : undefined;
    const payload = await apiFetch('/auth/forgot-password', {
      method: 'POST',
      ...(body ? { body } : {}),
    });
    return {
      ok: Boolean(payload?.ok),
      delivery: payload?.delivery ?? null,
      message: payload?.message || 'The API did not provide reset delivery details.',
    };
  },

  signOut() {
    authToken.clear();
    clearCachedSession();
  },
};

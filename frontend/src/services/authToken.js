const TOKEN_KEY = 'nivasa.auth.token';

export const authToken = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Storage can be disabled; callers still receive an explicit API result.
    }
  },
  clear() {
    this.set(null);
  },
};

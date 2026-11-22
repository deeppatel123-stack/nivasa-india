const STORAGE_KEY = 'nivasa.demo.session';
/**
 * UI-only authentication stub. No credentials are transmitted or verified.
 * Google sign-in is a visual placeholder until a real provider is connected.
 */
export const authService = {
    getSession() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        }
        catch {
            return null;
        }
    },
    async signIn(email, password) {
        if (!/^\S+@\S+\.\S+$/.test(email))
            return { ok: false, message: 'Enter a valid email address.' };
        if (password.length < 6)
            return { ok: false, message: 'Password must be at least 6 characters.' };
        const user = {
            id: 'demo-user',
            name: email.split('@')[0].replace(/[._-]/g, ' '),
            email,
            provider: 'email',
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return { ok: true, user, message: 'Demo session created. No real account was registered.' };
    },
    async signUp(name, email, password) {
        if (name.trim().length < 2)
            return { ok: false, message: 'Enter your name.' };
        if (!/^\S+@\S+\.\S+$/.test(email))
            return { ok: false, message: 'Enter a valid email address.' };
        if (password.length < 6)
            return { ok: false, message: 'Password must be at least 6 characters.' };
        const user = { id: 'demo-user', name: name.trim(), email, provider: 'email' };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return { ok: true, user, message: 'Demo account created locally. No real account was registered.' };
    },
    async googleSignIn() {
        return {
            ok: false,
            message: 'Google sign-in UI preview only. Connect an identity provider to enable real sign-in.',
        };
    },
    async requestPasswordReset(email) {
        if (!/^\S+@\S+\.\S+$/.test(email))
            return { ok: false, message: 'Enter a valid email address.' };
        return { ok: true, message: 'No email was sent — password reset requires a backend in a later phase.' };
    },
    signOut() {
        localStorage.removeItem(STORAGE_KEY);
    },
};

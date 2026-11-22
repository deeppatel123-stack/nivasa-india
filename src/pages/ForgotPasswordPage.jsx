import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { AuthLayout } from '@/components/account/AuthLayout';
import { GoogleSignInButton } from '@/components/account/GoogleSignInButton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];
function safeRedirect(value) {
    if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//'))
        return null;
    if (AUTH_ROUTES.includes(value))
        return null;
    return value;
}
export function ForgotPasswordPage() {
    const location = useLocation();
    const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
    const pushToast = useToastStore((state) => state.push);
    const [email, setEmail] = useState('');
    const [error, setError] = useState();
    const [message, setMessage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const requestedFrom = safeRedirect(location.state?.from);
    const loginTo = requestedFrom ? { pathname: '/login', state: { from: requestedFrom } } : '/login';
    const registerTo = requestedFrom ? { pathname: '/register', state: { from: requestedFrom } } : '/register';
    const onSubmit = async (event) => {
        event.preventDefault();
        const trimmed = email.trim();
        if (!trimmed) {
            setError('Enter your email address.');
            setMessage(null);
            return;
        }
        if (!EMAIL_PATTERN.test(trimmed)) {
            setError('Enter a valid email address.');
            setMessage(null);
            return;
        }
        setError(undefined);
        setMessage(null);
        setSubmitting(true);
        try {
            const result = await requestPasswordReset(trimmed);
            setMessage(result.message);
            pushToast(result.message, result.ok ? 'info' : 'warning');
        }
        catch {
            const fallback = 'No email was sent — password reset requires a backend in a later phase.';
            setMessage(fallback);
            pushToast(fallback, 'warning');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (<AuthLayout eyebrow="Account help" title="Password reset preview" description="See how the reset request will work once a backend is connected. Nothing is sent today." footer={<>
          Remembered your password?{' '}
          <Link to={loginTo} className="font-semibold text-teal-700 hover:text-teal-900">Return to log in</Link>
          {' · '}
          <Link to={registerTo} className="font-semibold text-teal-700 hover:text-teal-900">Create a demo account</Link>
        </>} backTo="/" backLabel="Back to home">
      <div className="demo-strip mb-6" role="note">
        <span>
          <strong className="font-semibold">No email is sent in this phase.</strong> This form only previews the reset
          flow; there is no mail service or password change behind it.
        </span>
      </div>

      <form noValidate onSubmit={onSubmit} className="space-y-5">
        <Input id="reset-email" label="Email address" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" leftIcon={<Mail className="h-4 w-4" aria-hidden/>} value={email} onChange={(event) => {
            setEmail(event.target.value);
            setError(undefined);
            setMessage(null);
        }} error={error} disabled={submitting}/>

        <div className="flex items-center gap-2">
          <Badge tone="amber">No email will be sent</Badge>
          <span className="text-[11px] text-ink-500">Frontend-only request</span>
        </div>

        {message && (<div role="status" aria-live="polite" className="rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-3 text-sm leading-relaxed text-teal-900">
            <p className="font-semibold">Demo response</p>
            <p className="mt-1">{message}</p>
            <p className="mt-2 text-xs text-teal-800">
              Your email address is not stored or transmitted. Reset links will require a backend in a later phase.
            </p>
          </div>)}

        <Button type="submit" fullWidth size="lg" loading={submitting} rightIcon={<ArrowRight className="h-4 w-4" aria-hidden/>}>
          {submitting ? 'Checking…' : 'Request password reset'}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-ink-100"/>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">other demo actions</span>
        <span className="h-px flex-1 bg-ink-100"/>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-ink-500">
        Google sign-in is a UI preview too and cannot recover a password.
      </p>
      <GoogleSignInButton label="Google sign-in preview"/>
    </AuthLayout>);
}

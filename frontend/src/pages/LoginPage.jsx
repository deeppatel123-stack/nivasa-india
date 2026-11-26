import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { AuthLayout } from '@/components/account/AuthLayout';
import { PasswordInput } from '@/components/account/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore, useAuthVerification } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

function safeRedirect(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return null;
  if (AUTH_ROUTES.includes(value)) return null;
  return value;
}

function validate(email, password) {
  const errors = {};
  const trimmed = email.trim();
  if (!trimmed) errors.email = 'Enter your email address.';
  else if (!EMAIL_PATTERN.test(trimmed)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Enter your password.';
  return errors;
}

export function LoginPage() {
  useAuthVerification();
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useAuthStore((state) => state.signIn);
  const pushToast = useToastStore((state) => state.push);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function defaultDestinationForRole(role) {
    if (role === 'owner') return '/owner/dashboard';
    if (role === 'admin') return '/admin';
    return '/dashboard';
  }

  const requestedFrom = safeRedirect(location.state?.from);
  const queryFrom = safeRedirect(new URLSearchParams(location.search).get('redirect'));
  const registerTo = requestedFrom ? { pathname: '/register', state: { from: requestedFrom } } : '/register';
  const resetTo = requestedFrom ? { pathname: '/forgot-password', state: { from: requestedFrom } } : '/forgot-password';

  const onSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormMessage('Please correct the highlighted fields before continuing.');
      return;
    }
    setFormMessage(null);
    setSubmitting(true);
    try {
      const result = await signIn(email.trim(), password);
      if (result.ok) {
        pushToast('Signed in successfully.', 'success');
        const role = result.user?.role;
        navigate(requestedFrom ?? queryFrom ?? defaultDestinationForRole(role), { replace: true });
      } else {
        setFormMessage(result.message || 'Could not sign in. Please try again.');
        pushToast(result.message || 'Could not sign in.', 'warning');
      }
    } catch (error) {
      const message = error?.message || 'Could not sign in. Please try again.';
      setFormMessage(message);
      pushToast(message, 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to Nivasa"
      description="Sign in to access your saved places, comparisons, and account."
      footer={
        <>
          New here?{' '}
          <Link to={registerTo} className="font-semibold text-teal-700 hover:text-teal-900">
            Create an account
          </Link>
        </>
      }
      backTo="/"
      backLabel="Back to home"
    >
      <form noValidate onSubmit={onSubmit} className="space-y-5">
        <Input
          id="login-email"
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" aria-hidden />}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors((current) => ({ ...current, email: undefined }));
            setFormMessage(null);
          }}
          error={errors.email}
          disabled={submitting}
        />

        <PasswordInput
          id="login-password"
          label="Password"
          visibilityLabel="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((current) => ({ ...current, password: undefined }));
            setFormMessage(null);
          }}
          error={errors.password}
          disabled={submitting}
        />

        <div className="flex justify-end">
          <Link to={resetTo} className="text-xs font-semibold text-ink-600 transition hover:text-teal-700">
            Forgot password?
          </Link>
        </div>

        {formMessage && (
          <div role="alert" aria-live="assertive" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-relaxed text-red-800">
            {formMessage}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={submitting} rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}>
          {submitting ? 'Signing in…' : 'Log in'}
        </Button>
      </form>
    </AuthLayout>
  );
}

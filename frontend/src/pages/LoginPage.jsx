import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { AuthLayout } from '@/components/account/AuthLayout';
import { PasswordInput } from '@/components/account/PasswordInput';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore, useAuthVerification } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

/** Only allow local, non-auth redirect targets provided by app navigation. */
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

  const requestedFrom = safeRedirect(location.state?.from);
  const queryFrom = safeRedirect(new URLSearchParams(location.search).get('redirect'));
  const redirectTo = requestedFrom ?? queryFrom ?? '/profile';
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
        pushToast(result.message, 'success');
        navigate(redirectTo, { replace: true });
      } else {
        setFormMessage(result.message);
        pushToast(result.message, 'warning');
      }
    } catch (error) {
      const message = error?.message || 'Could not sign in. Please try again.';
      setFormMessage(message);
      pushToast(message, 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  return (<AuthLayout eyebrow="Welcome back" title="Log in to Nivasa" description="Use your registered email and password to access your account." footer={<>
        New here? <Link to={registerTo} className="font-semibold text-teal-700 hover:text-teal-900">Create an account</Link>
      </>} backTo="/" backLabel="Back to home">
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      <Input id="login-email" label="Email address" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" leftIcon={<Mail className="h-4 w-4" aria-hidden/>} value={email} onChange={(event) => {
          setEmail(event.target.value);
          setErrors((current) => ({ ...current, email: undefined }));
          setFormMessage(null);
        }} error={errors.email} disabled={submitting}/>

      <PasswordInput id="login-password" label="Password" visibilityLabel="password" autoComplete="current-password" placeholder="Enter your password" leftIcon={<LockKeyhole className="h-4 w-4" aria-hidden/>} value={password} onChange={(event) => {
          setPassword(event.target.value);
          setErrors((current) => ({ ...current, password: undefined }));
          setFormMessage(null);
        }} error={errors.password} disabled={submitting}/>

      <div className="flex items-center justify-between gap-3">
        <Badge tone="neutral">Email account</Badge>
        <Link to={resetTo} className="text-xs font-semibold text-ink-600 transition hover:text-teal-700">
          Password help
        </Link>
      </div>

      {formMessage && (<div role="alert" aria-live="assertive" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-relaxed text-red-800">
          {formMessage}
        </div>)}

      <Button type="submit" fullWidth size="lg" loading={submitting} rightIcon={<ArrowRight className="h-4 w-4" aria-hidden/>}>
        {submitting ? 'Signing in…' : 'Log in'}
      </Button>
    </form>

    <p className="mt-5 text-xs leading-relaxed text-ink-500">
      Credentials are checked by the Nivasa API. Your session token is kept in this browser and is removed when you sign
      out.
    </p>
  </AuthLayout>);
}

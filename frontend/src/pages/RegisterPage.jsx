import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { AuthLayout } from '@/components/account/AuthLayout';
import { PasswordInput } from '@/components/account/PasswordInput';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
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

function validate(name, email, password, confirm, acknowledged) {
  const errors = {};
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  if (!trimmedName) errors.name = 'Enter your name.';
  else if (trimmedName.length < 2) errors.name = 'Use at least 2 characters.';
  if (!trimmedEmail) errors.email = 'Enter your email address.';
  else if (!EMAIL_PATTERN.test(trimmedEmail)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Create a password.';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
  if (!confirm) errors.confirm = 'Confirm your password.';
  else if (confirm !== password) errors.confirm = 'Passwords do not match.';
  if (!acknowledged) errors.acknowledged = 'Please acknowledge that you have read the draft policies.';
  return errors;
}

export function RegisterPage() {
  useAuthVerification();
  const navigate = useNavigate();
  const location = useLocation();
  const signUp = useAuthStore((state) => state.signUp);
  const pushToast = useToastStore((state) => state.push);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const requestedFrom = safeRedirect(location.state?.from);
  const queryFrom = safeRedirect(new URLSearchParams(location.search).get('redirect'));
  const redirectTo = requestedFrom ?? queryFrom ?? '/profile';
  const loginTo = requestedFrom ? { pathname: '/login', state: { from: requestedFrom } } : '/login';

  const onSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(name, email, password, confirm, acknowledged);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormMessage('Please correct the highlighted fields before continuing.');
      return;
    }
    setFormMessage(null);
    setSubmitting(true);
    try {
      const result = await signUp(name.trim(), email.trim(), password);
      if (result.ok) {
        pushToast(result.message, 'success');
        navigate(redirectTo, { replace: true });
      } else {
        setFormMessage(result.message);
        pushToast(result.message, 'warning');
      }
    } catch (error) {
      const message = error?.message || 'Could not create your account. Please try again.';
      setFormMessage(message);
      pushToast(message, 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  return (<AuthLayout eyebrow="Get started" title="Create an account" description="Register with the Nivasa API to keep an account alongside your shortlist." footer={<>
        Already registered? <Link to={loginTo} className="font-semibold text-teal-700 hover:text-teal-900">Log in</Link>
      </>} backTo="/" backLabel="Back to home">
    <form noValidate onSubmit={onSubmit} className="space-y-4">
      <Input id="register-name" label="Full name" type="text" autoComplete="name" placeholder="Your name" leftIcon={<UserRound className="h-4 w-4" aria-hidden/>} value={name} onChange={(event) => {
          setName(event.target.value);
          setErrors((current) => ({ ...current, name: undefined }));
          setFormMessage(null);
        }} error={errors.name} disabled={submitting}/>

      <Input id="register-email" label="Email address" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" leftIcon={<Mail className="h-4 w-4" aria-hidden/>} value={email} onChange={(event) => {
          setEmail(event.target.value);
          setErrors((current) => ({ ...current, email: undefined }));
          setFormMessage(null);
        }} error={errors.email} disabled={submitting}/>

      <PasswordInput id="register-password" label="Password" visibilityLabel="password" autoComplete="new-password" placeholder="At least 8 characters" leftIcon={<LockKeyhole className="h-4 w-4" aria-hidden/>} value={password} onChange={(event) => {
          setPassword(event.target.value);
          setErrors((current) => ({ ...current, password: undefined, confirm: undefined }));
          setFormMessage(null);
        }} error={errors.password} disabled={submitting}/>

      <PasswordInput id="register-confirm-password" label="Confirm password" visibilityLabel="confirm password" autoComplete="new-password" placeholder="Re-enter your password" leftIcon={<LockKeyhole className="h-4 w-4" aria-hidden/>} value={confirm} onChange={(event) => {
          setConfirm(event.target.value);
          setErrors((current) => ({ ...current, confirm: undefined }));
          setFormMessage(null);
        }} error={errors.confirm} disabled={submitting}/>

      <div>
        <Checkbox checked={acknowledged} onChange={(checked) => {
          setAcknowledged(checked);
          setErrors((current) => ({ ...current, acknowledged: undefined }));
          setFormMessage(null);
        }} label="I have read the draft privacy policy and draft terms" description="Both documents explain how account data is stored and what is not available yet." disabled={submitting}/>
        {errors.acknowledged && (<p role="alert" className="mt-1.5 text-xs text-red-600">{errors.acknowledged}</p>)}
        <p className="mt-2 text-[11px] text-ink-500">
          <Link to="/privacy" className="font-semibold text-teal-700 hover:underline">Privacy policy</Link>
          {' · '}
          <Link to="/terms" className="font-semibold text-teal-700 hover:underline">Terms of use</Link>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">API account</Badge>
        <span className="text-[11px] text-ink-500">Profile data is stored by the Nivasa API.</span>
      </div>

      {formMessage && (<div role="alert" aria-live="assertive" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-relaxed text-red-800">
          {formMessage}
        </div>)}

      <Button type="submit" fullWidth size="lg" loading={submitting} rightIcon={<ArrowRight className="h-4 w-4" aria-hidden/>}>
        {submitting ? 'Creating account…' : 'Create account'}
      </Button>
    </form>

    <p className="mt-5 text-xs leading-relaxed text-ink-500">
      Your details are sent to the API. Email delivery is not configured, so account email is used for sign-in only.
    </p>
  </AuthLayout>);
}

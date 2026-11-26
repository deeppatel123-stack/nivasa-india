import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Mail, Search, UserRound } from 'lucide-react';
import { AuthLayout } from '@/components/account/AuthLayout';
import { PasswordInput } from '@/components/account/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { useAuthStore, useAuthVerification } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

const ROLE_OPTIONS = [
  {
    value: 'student',
    label: 'Student',
    description: 'Find PGs, hostels, or rooms near college or campus.',
    icon: Search,
  },
  {
    value: 'professional',
    label: 'Working professional',
    description: 'Search rentals near office, commute routes, or city hubs.',
    icon: UserRound,
  },
  {
    value: 'owner',
    label: 'Property owner',
    description: 'List and manage your property details and enquiries.',
    icon: Building2,
  },
];

function safeRedirect(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return null;
  if (AUTH_ROUTES.includes(value)) return null;
  return value;
}

function validate(name, email, password, confirm, role, acknowledged) {
  const errors = {};
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  if (trimmedName.length < 2) errors.name = 'Enter your name (at least 2 characters).';
  if (!EMAIL_PATTERN.test(trimmedEmail)) errors.email = 'Enter a valid email address.';
  if (!role) errors.role = 'Choose how you want to use Nivasa.';
  if (password.length < 8) errors.password = 'Choose a password with at least 8 characters.';
  if (password && confirm !== password) errors.confirm = 'Passwords do not match.';
  if (!acknowledged) errors.acknowledged = 'Please accept the terms to continue.';
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
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const requestedFrom = safeRedirect(location.state?.from);
  const defaultDestination = role === 'owner' ? '/owner/dashboard' : '/dashboard';

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(name, email, password, confirm, role, acknowledged);
    setErrors(nextErrors);
    setFormMessage('');
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await signUp(name.trim(), email.trim().toLowerCase(), password, role);
      if (result.ok) {
        pushToast('Account created. Welcome to Nivasa.', 'success');
        navigate(requestedFrom || defaultDestination, { replace: true });
      } else {
        setFormMessage(result.message || 'Could not create your account. Please try again.');
      }
    } catch (error) {
      const message = error?.message || 'Could not create your account. Please try again.';
      setFormMessage(message);
      if (error?.status === 409) setErrors((prev) => ({ ...prev, email: 'An account with this email already exists. Try logging in.' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Create account"
      title="Join Nivasa"
      description="Create an account to save places, compare options, and manage your property activity."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={requestedFrom ? { from: requestedFrom } : undefined} className="font-semibold text-teal-700 hover:text-teal-900">
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {formMessage && (
          <div role="alert" aria-live="assertive" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-relaxed text-red-800">
            {formMessage}
          </div>
        )}

        <fieldset>
          <legend className="field-label mb-2">Account type</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {ROLE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const selected = role === option.value;
              return (
                <label
                  key={option.value}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition',
                    selected ? 'border-teal-500 bg-teal-50/60 ring-1 ring-teal-500/20' : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50/50',
                  )}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={selected}
                    onChange={() => {
                      setRole(option.value);
                      setErrors((prev) => ({ ...prev, role: undefined }));
                    }}
                    className="mt-1 h-4 w-4 accent-teal-700"
                    disabled={submitting}
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                      <Icon className="h-4 w-4 text-teal-700" aria-hidden />
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-ink-500">{option.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors.role && <p className="mt-1.5 text-xs text-red-600">{errors.role}</p>}
        </fieldset>

        <Input
          label="Full name"
          placeholder="Enter your full name"
          value={name}
          autoComplete="name"
          leftIcon={<UserRound className="h-4 w-4" />}
          onChange={(event) => {
            setName(event.target.value);
            setErrors((prev) => ({ ...prev, name: undefined }));
            setFormMessage('');
          }}
          error={errors.name}
          disabled={submitting}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="Enter your email address"
          value={email}
          autoComplete="email"
          leftIcon={<Mail className="h-4 w-4" />}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors((prev) => ({ ...prev, email: undefined }));
            setFormMessage('');
          }}
          error={errors.email}
          disabled={submitting}
        />

        <PasswordInput
          label="Password"
          value={password}
          autoComplete="new-password"
          hint="At least 8 characters."
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((prev) => ({ ...prev, password: undefined, confirm: undefined }));
            setFormMessage('');
          }}
          error={errors.password}
          disabled={submitting}
        />

        <PasswordInput
          label="Confirm password"
          value={confirm}
          autoComplete="new-password"
          onChange={(event) => {
            setConfirm(event.target.value);
            setErrors((prev) => ({ ...prev, confirm: undefined }));
            setFormMessage('');
          }}
          error={errors.confirm}
          disabled={submitting}
        />

        <div>
          <Checkbox
            checked={acknowledged}
            onChange={(value) => {
              setAcknowledged(value);
              setErrors((prev) => ({ ...prev, acknowledged: undefined }));
            }}
            disabled={submitting}
            label="I agree to the Terms and Privacy Policy"
            description={
              <>
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="font-semibold text-teal-700 hover:underline">Terms</Link> and{' '}
                <Link to="/privacy" className="font-semibold text-teal-700 hover:underline">Privacy Policy</Link>.
              </>
            }
          />
          {errors.acknowledged && <p className="mt-1.5 text-xs text-red-600">{errors.acknowledged}</p>}
        </div>

        <Button type="submit" variant="secondary" className="w-full" size="lg" loading={submitting} rightIcon={<ArrowRight className="h-4 w-4" />}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}

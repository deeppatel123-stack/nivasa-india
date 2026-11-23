import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Info, ShieldAlert } from 'lucide-react';
import { AuthLayout } from '@/components/account/AuthLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore, useAuthVerification } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';

function safeRedirect(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return null;
  if (['/login', '/register', '/forgot-password'].includes(value)) return null;
  return value;
}

export function ForgotPasswordPage() {
  useAuthVerification();
  const location = useLocation();
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const pushToast = useToastStore((state) => state.push);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const requestedFrom = safeRedirect(location.state?.from);
  const loginTo = requestedFrom ? { pathname: '/login', state: { from: requestedFrom } } : '/login';

  const checkStatus = async () => {
    setChecking(true);
    setError(null);
    setStatus(null);
    try {
      const result = await requestPasswordReset();
      setStatus(result);
      pushToast(result.message, 'info');
    } catch (caught) {
      const message = caught?.message || 'Could not check reset delivery with the API.';
      setError(message);
      pushToast(message, 'warning');
    } finally {
      setChecking(false);
    }
  };

  return (<AuthLayout eyebrow="Account help" title="Password reset" description="Check the current reset delivery status reported by the Nivasa API." footer={<>
        Remembered your password? <Link to={loginTo} className="font-semibold text-teal-700 hover:text-teal-900">Return to log in</Link>
      </>} backTo="/" backLabel="Back to home">
    <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-900" role="note">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden/>
      <span>
        <strong className="font-semibold">Email delivery is not configured.</strong> No reset email can be sent, so this
        page does not ask for your address or change any password.
      </span>
    </div>

    <div className="surface-muted rounded-xl border border-ink-100 p-4">
      <p className="text-sm font-semibold text-ink-900">What you can check</p>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-600">
        The account endpoint reports whether reset messages can be delivered. Checking the status is the only action
        available here; it does not queue a message.
      </p>
      <div className="mt-4">
        <Button type="button" variant="outline" fullWidth loading={checking} onClick={checkStatus} rightIcon={<ArrowRight className="h-4 w-4" aria-hidden/>}>
          {checking ? 'Checking…' : 'Check reset status'}
        </Button>
      </div>
    </div>

    {status && (<div role="status" aria-live="polite" className="mt-5 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-3 text-sm leading-relaxed text-teal-900">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">API status</p>
          {status.delivery && <Badge tone="amber">{status.delivery}</Badge>}
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-teal-800">{status.message}</p>
        <p className="mt-2 flex items-start gap-1.5 text-[11px] text-teal-800">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden/>
          No email was sent and no password was changed.
        </p>
      </div>)}

    {error && (<div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-relaxed text-red-800">
        {error}
      </div>)}

    <p className="mt-5 text-xs leading-relaxed text-ink-500">
      If delivery becomes available, this page will report the new status. No support email or phone number is published
      here.
    </p>
  </AuthLayout>);
}

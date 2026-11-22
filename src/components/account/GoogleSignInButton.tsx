import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { authService } from '@/features/auth/authService';
import { useToastStore } from '@/store/useToastStore';

function GoogleMark() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M17.6 10.2c0-.6-.05-1.15-.16-1.7H10v3.22h4.28a3.65 3.65 0 0 1-1.59 2.4v2h2.57c1.5-1.39 2.34-3.44 2.34-5.92Z" fill="#4285F4" />
      <path d="M10 18c2.16 0 3.97-.72 5.29-1.94l-2.57-2c-.71.48-1.63.77-2.72.77-2.09 0-3.86-1.41-4.49-3.3H2.84v2.06A8 8 0 0 0 10 18Z" fill="#34A853" />
      <path d="M5.51 11.53a4.8 4.8 0 0 1 0-3.06V6.41H2.84a8 8 0 0 0 0 7.18l2.67-2.06Z" fill="#FBBC05" />
      <path d="M10 4.9c1.18 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 2.84 6.4l2.67 2.07C6.14 6.31 7.91 4.9 10 4.9Z" fill="#EA4335" />
    </svg>
  );
}

/**
 * Google is intentionally a visual preview in this phase. The message returned by
 * authService is shown verbatim so nothing suggests a real sign-in happened.
 */
export function GoogleSignInButton({ label = 'Continue with Google' }: { label?: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const pushToast = useToastStore((state) => state.push);

  const onClick = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await authService.googleSignIn();
      setMessage(result.message);
      pushToast(result.message, result.ok ? 'success' : 'info');
    } catch {
      const fallback = 'Google sign-in UI preview only. No identity provider is connected.';
      setMessage(fallback);
      pushToast(fallback, 'warning');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        fullWidth
        onClick={onClick}
        disabled={busy}
        leftIcon={<GoogleMark />}
      >
        <span>{label}</span>
        <Badge tone="amber" className="ml-2">
          Preview
        </Badge>
      </Button>
      {message && (
        <p role="status" aria-live="polite" className="demo-strip mt-3">
          {message}
        </p>
      )}
    </div>
  );
}

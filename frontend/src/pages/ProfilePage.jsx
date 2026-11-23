import { Link, useNavigate } from 'react-router-dom';
import { Clock3, Compass, Heart, History, LogOut, Mail, Map, Scale, UserRound } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatStorageMode } from '@/services/storageMode';
import { useAuthStore, useAuthVerification } from '@/store/useAuthStore';
import { useCompareStore } from '@/store/useCompareStore';
import { useRecentlyViewedStore } from '@/store/useRecentlyViewedStore';
import { useSavedStore } from '@/store/useSavedStore';
import { useToastStore } from '@/store/useToastStore';

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  return parts.slice(0, 2).map((part) => part[0] ?? '').join('').toUpperCase();
}

const QUICK_LINKS = [
  { to: '/search', label: 'Location search', description: 'Search records near any Indian location', icon: Compass },
  { to: '/map', label: 'Map search', description: 'Check records by area and radius', icon: Map },
  { to: '/wishlist', label: 'Saved stays', description: 'Your shortlist on this device', icon: Heart },
  { to: '/recently-viewed', label: 'Recently viewed', description: 'Records you opened last', icon: History },
  { to: '/compare', label: 'Comparison', description: 'Up to four records side by side', icon: Scale },
];

export function ProfilePage() {
  useAuthVerification();
  const navigate = useNavigate();
  const { user, storage, tokenMode, status, error, signOut } = useAuthStore();
  const pushToast = useToastStore((state) => state.push);
  const savedCount = useSavedStore((state) => state.ids.length);
  const compareCount = useCompareStore((state) => state.ids.length);
  const recentCount = useRecentlyViewedStore((state) => state.ids.length);

  const handleSignOut = () => {
    signOut();
    pushToast('Signed out of your account.', 'info');
    navigate('/');
  };

  if (!user && (status === 'idle' || status === 'verifying')) {
    return (<PageShell title="Your profile" eyebrow="Account" description="Checking your session with the API…">
      <div className="card space-y-4 p-6" aria-busy="true" aria-live="polite">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-4 w-40" />
      </div>
    </PageShell>);
  }

  if (!user) {
    return (<PageShell title="Your profile" eyebrow="Account" description="Sign in to see the account details stored by the Nivasa API.">
      <EmptyState
        icon={UserRound}
        title="You are not signed in"
        description="Log in to view your account, or create one to save your profile with the API. Your local shortlist stays available on this device either way."
        action={<Link to="/login" className={buttonClasses('primary', 'md')}>Log in</Link>}
        secondary={<Link to="/register" className={buttonClasses('outline', 'md')}>Create an account</Link>}
      />
    </PageShell>);
  }

  const counts = [
    { to: '/wishlist', label: 'Saved', count: savedCount, icon: Heart },
    { to: '/compare', label: 'Comparing', count: compareCount, icon: Scale },
    { to: '/recently-viewed', label: 'Recently viewed', count: recentCount, icon: Clock3 },
  ];

  return (<PageShell title="Your profile" eyebrow="Account" description="Account details returned by the Nivasa API.">
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <section className="card p-6 sm:p-8" aria-labelledby="profile-heading">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-teal-100 font-display text-lg font-extrabold text-teal-800">
                {initials(user.name)}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="profile-heading" className="font-display text-xl font-bold text-ink-950">
                    {user.name}
                  </h2>
                  {user.role && <Badge tone="teal">{user.role}</Badge>}
                  {status === 'authenticated' && <Badge tone="green">Session verified</Badge>}
                </div>
                <p className="mt-1 flex items-center gap-1.5 break-all text-sm text-ink-500">
                  <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden/>
                  {user.email}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" leftIcon={<LogOut className="h-3.5 w-3.5" aria-hidden/>} onClick={handleSignOut}>
              Sign out
            </Button>
          </div>

          <dl className="mt-7 grid gap-4 border-t border-ink-100 pt-6 sm:grid-cols-2">
            <div>
              <dt className="field-label">Account ID</dt>
              <dd className="break-all font-mono text-xs text-ink-800">{user.id}</dd>
            </div>
            <div>
              <dt className="field-label">Sign-in method</dt>
              <dd className="text-sm font-medium text-ink-800">Email and password</dd>
            </div>
            <div>
              <dt className="field-label">Record storage</dt>
              <dd className="text-sm font-medium text-ink-800">{formatStorageMode(storage)}</dd>
            </div>
            <div>
              <dt className="field-label">Session token</dt>
              <dd className="text-sm font-medium text-ink-800">{tokenMode || 'Bearer token in this browser'}</dd>
            </div>
          </dl>

          {status === 'error' && (<p role="status" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-900">
              This session could not be verified just now: {error || 'API unavailable'}. The details above are from the
              last response received.
            </p>)}

          <p className="mt-6 rounded-xl bg-ink-50 px-3.5 py-3 text-xs leading-relaxed text-ink-600" role="note">
            Your profile is stored by the API in MongoDB when configured, otherwise in a local development file. Signing
            out removes the token and cached account from this browser; it does not delete the server record.
          </p>
        </section>

        <section aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
            Shortlist on this device
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {counts.map(({ to, label, count, icon: Icon }) => (<Link key={to} to={to} className="card group p-4 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lift" aria-label={`${label}: ${count}`}>
                <span className="flex items-center justify-between text-ink-500">
                  <Icon className="h-4 w-4" aria-hidden/>
                  <span className="font-display text-2xl font-extrabold text-ink-950">{count}</span>
                </span>
                <span className="mt-2 block text-xs font-semibold text-ink-700 group-hover:text-teal-700">{label}</span>
              </Link>))}
          </div>
        </section>
      </div>

      <aside className="space-y-6" aria-label="Profile shortcuts">
        <section className="card p-5" aria-labelledby="quick-links-heading">
          <h2 id="quick-links-heading" className="font-display text-base font-bold text-ink-950">
            Quick links
          </h2>
          <div className="mt-3 space-y-1">
            {QUICK_LINKS.map(({ to, label, description, icon: Icon }) => (<Link key={to} to={to} className="flex items-start gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-ink-50">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-50 text-ink-600">
                  <Icon className="h-4 w-4" aria-hidden/>
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink-800">{label}</span>
                  <span className="block text-xs text-ink-500">{description}</span>
                </span>
              </Link>))}
          </div>
        </section>

        <section className="card surface-muted p-5" aria-labelledby="data-note-heading">
          <h2 id="data-note-heading" className="font-display text-sm font-bold text-ink-900">
            About the records you see
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-ink-600">
            Listings come from attributed OpenStreetMap records and supplied submissions. Rent, availability and contact
            details are often “Not available”. No partner APIs, Google Places key or paid data feeds are connected.
          </p>
          <Link to="/faq" className="mt-3 inline-block text-xs font-semibold text-teal-700 hover:underline">
            Read the FAQ
          </Link>
        </section>
      </aside>
    </div>
  </PageShell>);
}

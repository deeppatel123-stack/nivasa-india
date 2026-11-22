import { Link, useNavigate } from 'react-router-dom';
import { Clock3, Compass, Heart, History, LogOut, Mail, Map, Scale, UserRound } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonClasses } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useCompareStore } from '@/store/useCompareStore';
import { useRecentlyViewedStore } from '@/store/useRecentlyViewedStore';
import { useSavedStore } from '@/store/useSavedStore';
import { useToastStore } from '@/store/useToastStore';
function initials(name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0)
        return 'U';
    return parts
        .slice(0, 2)
        .map((part) => part[0] ?? '')
        .join('')
        .toUpperCase();
}
const QUICK_LINKS = [
    { to: '/wishlist', label: 'Saved stays', description: 'Your shortlist in this browser', icon: Heart },
    { to: '/recently-viewed', label: 'Recently viewed', description: 'Places you opened last', icon: History },
    { to: '/compare', label: 'Comparison', description: 'Up to four demo stays side by side', icon: Scale },
    { to: '/explore', label: 'Explore stays', description: 'Browse all demo listings', icon: Compass },
];
export function ProfilePage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const signOut = useAuthStore((state) => state.signOut);
    const pushToast = useToastStore((state) => state.push);
    const savedCount = useSavedStore((state) => state.ids.length);
    const compareCount = useCompareStore((state) => state.ids.length);
    const recentCount = useRecentlyViewedStore((state) => state.ids.length);
    const handleSignOut = () => {
        signOut();
        pushToast('Demo session ended. No real account was affected.', 'info');
        navigate('/');
    };
    if (!user) {
        return (<PageShell title="Your profile" description="Sign in to preview how a personal space would work in this frontend prototype." eyebrow="Account" showDemoNote={false}>
        <EmptyState icon={UserRound} title="No demo session yet" description="There is no account to show because this phase has no backend. Start a local demo session to see saved stays, comparisons and recently viewed places together." action={<Link to="/login" className={buttonClasses('primary', 'md')}>
              Log in to start a demo session
            </Link>} secondary={<Link to="/register" className={buttonClasses('outline', 'md')}>
              Create a demo account
            </Link>}/>
        <p className="mt-4 text-center text-xs text-ink-500">
          Nothing is stored on a server. Demo sessions and lists stay in this browser only.
        </p>
      </PageShell>);
    }
    const counts = [
        { to: '/wishlist', label: 'Saved', count: savedCount, icon: Heart },
        { to: '/compare', label: 'Comparing', count: compareCount, icon: Scale },
        { to: '/recently-viewed', label: 'Recently viewed', count: recentCount, icon: Clock3 },
    ];
    return (<PageShell title="Your profile" description="A local demo session — not a registered account." eyebrow="Account" showDemoNote={false}>
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
                    <Badge tone="amber">Demo session</Badge>
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
                <dt className="field-label">Account status</dt>
                <dd className="text-sm font-medium text-ink-800">
                  <Badge tone="amber">Demo session · not a real account</Badge>
                </dd>
              </div>
              <div>
                <dt className="field-label">Sign-in method</dt>
                <dd className="text-sm font-medium text-ink-800">
                  {user.provider === 'google' ? (<Badge tone="blue">Google preview</Badge>) : (<Badge tone="neutral">Email · demo only</Badge>)}
                </dd>
              </div>
            </dl>

            <p className="mt-6 rounded-xl bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-900" role="note">
              This session exists only in this browser's local storage. Signing out clears it; no profile, password or
              contact details are stored on a server.
            </p>
          </section>

          <section aria-labelledby="activity-heading">
            <h2 id="activity-heading" className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
              Your local activity
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
              <Link to="/map" className="flex items-start gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-ink-50">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-50 text-ink-600">
                  <Map className="h-4 w-4" aria-hidden/>
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink-800">Map discovery</span>
                  <span className="block text-xs text-ink-500">See demo stays by area</span>
                </span>
              </Link>
            </div>
          </section>

          <section className="card surface-muted p-5" aria-labelledby="demo-note-heading">
            <h2 id="demo-note-heading" className="font-display text-sm font-bold text-ink-900">
              About this prototype
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-ink-600">
              Nivasa is a frontend demo. All stays, prices and images are illustrative. No owner contact, booking or
              payment is available, and this profile is not a real account.
            </p>
          </section>
        </aside>
      </div>
    </PageShell>);
}

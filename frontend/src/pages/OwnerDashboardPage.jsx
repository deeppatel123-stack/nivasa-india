import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, ClipboardList, Clock3, Heart, LockKeyhole, MapPin, PlusCircle, ReceiptText, ShieldCheck } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { OwnerNav } from '@/components/owner/OwnerNav';
import { OwnerPreviewNotice } from '@/components/owner/OwnerPreviewNotice';
import { Badge } from '@/components/ui/Badge';
import { LinkButton } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useSavedStore } from '@/store/useSavedStore';

function OverviewCard({ icon: Icon, label, value, note, footer, tone = 'teal' }) {
  const iconTone = {
    teal: 'bg-teal-50 text-teal-700',
    amber: 'bg-amber-50 text-amber-700',
    ink: 'bg-ink-50 text-ink-700',
  }[tone];
  return (
    <div className="card flex flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className={cn('grid h-10 w-10 place-items-center rounded-xl', iconTone)}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-500">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink-950">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-ink-500">{note}</p>
      {footer && <div className="mt-4 border-t border-ink-100 pt-3 text-xs">{footer}</div>}
    </div>
  );
}

export function OwnerDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const savedCount = useSavedStore((state) => state.ids.length);
  const { data } = useQuery({
    queryKey: ['submissions', 'owner'],
    queryFn: ({ signal }) => apiFetch('/submissions', { signal }),
    enabled: Boolean(user),
    retry: false,
  });
  const submissions = data?.items ?? [];
  const pendingCount = submissions.filter((item) => String(item.status ?? '').toLowerCase() === 'pending').length;

  return (
    <PageShell
      eyebrow="For owners"
      title="Owner dashboard"
      description="Manage your property listings and track their review status."
      breadcrumbs={[{ label: 'Owner dashboard' }]}
      actions={
        <LinkButton to="/owner/add-property" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
          Add property
        </LinkButton>
      }
    >
      <div className="space-y-8">
        <OwnerNav />
        <OwnerPreviewNotice />

        <section aria-labelledby="owner-overview-heading">
          <div className="mb-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Overview</p>
            <h2 id="owner-overview-heading" className="font-display text-xl font-extrabold text-ink-950 sm:text-2xl">
              Your workspace at a glance
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <OverviewCard
              icon={Building2}
              label="Your listings"
              value={user ? String(submissions.length) : '—'}
              note={user ? 'Properties you have submitted.' : 'Log in to see your listings.'}
              footer={
                <Link to="/owner/listings" className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800">
                  Manage listings <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              }
            />
            <OverviewCard
              icon={Clock3}
              label="Pending review"
              value={user ? String(pendingCount) : '—'}
              note={user ? 'Listings waiting for review before publishing.' : 'Log in to see review status.'}
              tone="amber"
              footer={
                <Link to="/owner/listings" className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800">
                  View listings <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              }
            />
            <OverviewCard
              icon={Heart}
              label="Saved places"
              value={String(savedCount)}
              note="Places you saved in this browser."
              tone="ink"
              footer={
                <Link to="/wishlist" className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800">
                  View saved <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              }
            />
          </div>
        </section>

        {!user && (
          <section aria-labelledby="owner-login-heading" className="card flex flex-col gap-5 bg-ink-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div>
              <Badge tone="amber" icon={<LockKeyhole className="h-3 w-3" aria-hidden />}>Sign in required</Badge>
              <h2 id="owner-login-heading" className="mt-3 font-display text-xl font-extrabold">Log in to manage your properties</h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-100">
                Sign in to submit properties, track review status, and manage your listings.
              </p>
            </div>
            <LinkButton to="/login" state={{ from: '/owner/dashboard' }} variant="secondary" className="shrink-0" leftIcon={<LockKeyhole className="h-4 w-4" />}>
              Log in
            </LinkButton>
          </section>
        )}

        <section aria-labelledby="submission-details-heading">
          <SectionHeading eyebrow="Listing" title="What to include in your listing" description="Provide clear and accurate details to help people find the right place." />
          <ul className="grid gap-4 md:grid-cols-3">
            {[
              { icon: MapPin, title: 'Accurate location', text: 'Choose the correct location so people can find your property easily.' },
              { icon: ReceiptText, title: 'Clear pricing', text: 'Include rent, deposit, and any recurring charges separately.' },
              { icon: ShieldCheck, title: 'Correct details', text: 'Make sure contact and property details are accurate before submitting.' },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title} className="card p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-50 text-ink-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-sm font-bold text-ink-900">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-500">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="owner-next-steps-heading" className="space-y-4">
          <div>
            <p className="field-label">Next steps</p>
            <h2 id="owner-next-steps-heading" className="font-display text-lg font-extrabold text-ink-950">Manage your properties</h2>
          </div>
          <Link to="/owner/add-property" className="card group flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lift">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <PlusCircle className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-sm font-bold text-ink-900">Add property</span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-500">Submit a new property with location, pricing, and contact details.</span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                Open form <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </span>
          </Link>
          <Link to="/owner/listings" className="card group flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lift">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-700">
              <ClipboardList className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-sm font-bold text-ink-900">Manage listings</span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-500">Review your submitted properties and their status.</span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                Open listings <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </span>
          </Link>
        </section>
      </div>
    </PageShell>
  );
}

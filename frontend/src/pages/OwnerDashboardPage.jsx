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
    return (<div className="card flex flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className={cn('grid h-10 w-10 place-items-center rounded-xl', iconTone)}>
          <Icon className="h-5 w-5" aria-hidden/>
        </span>
        <Badge tone="neutral">Live count</Badge>
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-500">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink-950">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-ink-500">{note}</p>
      {footer && <div className="mt-4 border-t border-ink-100 pt-3 text-xs">{footer}</div>}
    </div>);
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
    return (<PageShell eyebrow="For owners" title="Owner workspace" description="Submit, review and track owner records with their real moderation status." breadcrumbs={[{ label: 'Owner dashboard' }]} actions={<LinkButton to="/owner/add-property" size="sm" leftIcon={<PlusCircle className="h-4 w-4"/>}>
          Add property
        </LinkButton>}>
      <div className="space-y-8">
        <OwnerNav />
        <OwnerPreviewNotice />

        <section aria-labelledby="owner-overview-heading">
          <div className="mb-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Overview</p>
            <h2 id="owner-overview-heading" className="font-display text-xl font-extrabold text-ink-950 sm:text-2xl">
              Your workspace at a glance
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-500">
              Submission counts come from the submissions API for the signed-in account. Saved properties come from
              this browser. No views, earnings or messages are counted here.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <OverviewCard icon={Building2} label="Your submissions" value={user ? String(submissions.length) : '—'} note={user
                    ? 'Owner records returned by the API, including those awaiting review.'
                    : 'Log in to load your submitted records.'} footer={<Link to="/owner/listings" className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800">
                   Open listing manager <ArrowRight className="h-3.5 w-3.5" aria-hidden/>
                 </Link>}/>
            <OverviewCard icon={Clock3} label="Pending moderation" value={user ? String(pendingCount) : '—'} note={user
                    ? 'Records with a pending status. These are not published.'
                    : 'Log in to see moderation status.'} tone="amber" footer={<Link to="/owner/listings" className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800">
                   Review records <ArrowRight className="h-3.5 w-3.5" aria-hidden/>
                 </Link>}/>
            <OverviewCard icon={Heart} label="Saved properties" value={String(savedCount)} note="Records saved in this browser for later comparison. These are not your submissions." tone="ink" footer={<Link to="/wishlist" className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800">
                   View shortlist <ArrowRight className="h-3.5 w-3.5" aria-hidden/>
                 </Link>}/>
          </div>
        </section>

        {!user && (<section aria-labelledby="owner-login-heading" className="card flex flex-col gap-5 bg-ink-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <Badge tone="amber" icon={<LockKeyhole className="h-3 w-3" aria-hidden/>}>
              Sign in required
            </Badge>
            <h2 id="owner-login-heading" className="mt-3 font-display text-xl font-extrabold">
              Log in to use the owner tools
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-100">
              Submissions and their moderation status are tied to your account. Saved properties remain available in
              this browser without signing in.
            </p>
          </div>
          <LinkButton to="/login" state={{ from: '/owner/dashboard' }} variant="secondary" className="shrink-0" leftIcon={<LockKeyhole className="h-4 w-4"/>}>
            Log in
          </LinkButton>
        </section>)}

        <section aria-labelledby="submission-details-heading">
          <SectionHeading eyebrow="Submission" title="What a submission records" description="Only verified facts you supply are saved; missing values stay missing rather than being filled in."/>
          <ul className="grid gap-4 md:grid-cols-3">
            {[
                { icon: MapPin, title: 'Mapped location', text: 'An Indian address with coordinates resolved from a geocoder, not typed coordinates.' },
                { icon: ReceiptText, title: 'Price breakdown', text: 'Rent, deposit and recurring charges recorded as separate amounts.' },
                { icon: ShieldCheck, title: 'Owner confirmation', text: 'Your account and confirmation that you are authorised to submit the record.' },
            ].map(({ icon: Icon, title, text }) => (<li key={title} className="card p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-50 text-ink-700">
                <Icon className="h-5 w-5" aria-hidden/>
              </span>
              <h3 className="mt-4 font-display text-sm font-bold text-ink-900">{title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-500">{text}</p>
            </li>))}
          </ul>
        </section>

        <section aria-labelledby="owner-next-steps-heading" className="space-y-4">
          <div>
            <p className="field-label">Next steps</p>
            <h2 id="owner-next-steps-heading" className="font-display text-lg font-extrabold text-ink-950">
              Open an owner tool
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-500">
              Add a record with a mapped location and price breakdown, then follow its status in the manager.
            </p>
          </div>
          <Link to="/owner/add-property" className="card group flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lift">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <PlusCircle className="h-5 w-5" aria-hidden/>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-sm font-bold text-ink-900">Add property</span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-500">
                Submit a property with a resolved Indian location, a full price breakdown and your contact channel.
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                Open the form <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden/>
              </span>
            </span>
          </Link>
          <Link to="/owner/listings" className="card group flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lift">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-700">
              <ClipboardList className="h-5 w-5" aria-hidden/>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-sm font-bold text-ink-900">Manage listings</span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-500">
                Review your submitted records with their status, publication flag, source and storage mode.
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                Open the manager <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden/>
              </span>
            </span>
          </Link>
        </section>
      </div>
    </PageShell>);
}

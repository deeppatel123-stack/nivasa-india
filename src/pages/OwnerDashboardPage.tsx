import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Check,
  ClipboardList,
  FileCheck2,
  Heart,
  Info,
  PlusCircle,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { OwnerNav } from '@/components/owner/OwnerNav';
import { OwnerPreviewNotice } from '@/components/owner/OwnerPreviewNotice';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { LinkButton } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/utils';
import { useSavedStore } from '@/store/useSavedStore';

const VERIFICATION_ITEMS = [
  {
    id: 'ownership',
    label: 'Ownership or authorization proof',
    description: 'Documents showing you may list the property.',
  },
  {
    id: 'address',
    label: 'Exact address and landmark',
    description: 'A precise location, not just a neighbourhood.',
  },
  {
    id: 'pricing',
    label: 'Full pricing breakdown',
    description: 'Rent, deposit and every recurring charge separated.',
  },
  {
    id: 'photos',
    label: 'Photos you have rights to use',
    description: 'Recent images of the actual room or building.',
  },
  {
    id: 'contact',
    label: 'Consented real contact details',
    description: 'A name and channel the owner agrees to show.',
  },
  {
    id: 'rules',
    label: 'House rules and availability',
    description: 'Agreed rules and the date a room becomes free.',
  },
] as const;

const WORKFLOW_STEPS: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: 'Collect verified details',
    description: 'Gather proof of ownership, an exact address, a transparent price breakdown and photo rights.',
    icon: FileCheck2,
  },
  {
    title: 'Explore the form',
    description: 'Walk through Add property to see which details a real listing would need. Nothing is saved.',
    icon: PlusCircle,
  },
  {
    title: 'Check your readiness',
    description: 'Use the checklist below as a local reminder. Ticking an item does not verify anything.',
    icon: ShieldCheck,
  },
  {
    title: 'Manage when connected',
    description: 'Drafts, verification and publishing belong to a later backend phase. Today the list is empty.',
    icon: ClipboardList,
  },
];

function OverviewCard({
  icon: Icon,
  label,
  value,
  note,
  footer,
  tone = 'teal',
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
  footer?: ReactNode;
  tone?: 'teal' | 'amber' | 'ink';
}) {
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
        <Badge tone="neutral">Local</Badge>
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-500">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink-950">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-ink-500">{note}</p>
      {footer && <div className="mt-4 border-t border-ink-100 pt-3 text-xs">{footer}</div>}
    </div>
  );
}

export function OwnerDashboardPage() {
  // Owner inventory is intentionally empty until a real backend and moderation exist.
  const [ownerListings] = useState<unknown[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const savedDemoCount = useSavedStore((state) => state.ids.length);
  const completedChecks = VERIFICATION_ITEMS.filter((item) => checkedItems[item.id]).length;
  const checklistPercent = Math.round((completedChecks / VERIFICATION_ITEMS.length) * 100);

  return (
    <PageShell
      eyebrow="For owners"
      title="Owner workspace"
      description="A preview of the tools an owner will use to prepare, verify and manage a listing."
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
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-500">
              These numbers come from this browser session only. No earnings, views, messages or enquiries are
              tracked in the frontend phase.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <OverviewCard
              icon={Building2}
              label="Owner listings"
              value={String(ownerListings.length)}
              note="No owner listings are stored in this phase. Nothing has been published."
              footer={
                <Link to="/owner/listings" className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800">
                  Open listing manager <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              }
            />
            <OverviewCard
              icon={Heart}
              label="Saved demo stays"
              value={String(savedDemoCount)}
              note="Your shortlist for comparison — these are demo examples, not your inventory."
              tone="amber"
              footer={
                <Link to="/wishlist" className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800">
                  View shortlist <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              }
            />
            <OverviewCard
              icon={ShieldCheck}
              label="Verification checklist"
              value={`${completedChecks}/${VERIFICATION_ITEMS.length}`}
              note="Items you have marked as ready below. This is a local reminder, not a submission."
              tone="ink"
              footer={<span className="text-ink-500">Progress is kept only until you reload this page.</span>}
            />
          </div>
        </section>

        <section className="card overflow-hidden" aria-labelledby="demo-guidance-heading">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 sm:p-7">
              <Badge tone="amber" icon={<Info className="h-3 w-3" aria-hidden />}>
                Demo guidance
              </Badge>
              <h2 id="demo-guidance-heading" className="mt-4 font-display text-xl font-extrabold text-ink-950">
                Saved demo stays are examples, not your listings
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-500">
                Explore and Wishlist contain illustrative, clearly labelled demo listings. Study their structure to
                understand which details a future listing will need — but no owner can claim, edit or publish them.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <LinkButton to="/explore" variant="outline" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                  Browse demo stays
                </LinkButton>
                <LinkButton to="/wishlist" variant="ghost" size="sm">
                  View shortlist
                </LinkButton>
              </div>
            </div>
            <div className="surface-muted border-t border-ink-100 p-6 sm:p-7 lg:border-l lg:border-t-0">
              <p className="field-label">What the demos can teach you</p>
              <ul className="mt-3 space-y-3 text-sm text-ink-700">
                {[
                  'How categories, occupancy and amenities are described',
                  'Why rent, deposit and monthly charges are shown separately',
                  'Which details need verification before a listing goes live',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs leading-relaxed text-ink-500">
                Demo prices are not market quotes and demo contact fields are intentionally empty.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="workflow-heading">
          <SectionHeading
            eyebrow="Process"
            title="The listing workflow"
            description="The intended path from preparation to management. Only the form previews are available today."
          />
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="card flex flex-col p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-50 text-ink-700">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="font-display text-xs font-bold tracking-widest text-ink-300">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-sm font-bold text-ink-900">{step.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-500">{step.description}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="card p-5 sm:p-6" aria-labelledby="requirements-heading">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="field-label">Before a real listing</p>
                <h2 id="requirements-heading" className="font-display text-lg font-extrabold text-ink-950">
                  Verified-data requirements
                </h2>
              </div>
              <Badge tone={completedChecks === VERIFICATION_ITEMS.length ? 'green' : 'neutral'}>
                {completedChecks} of {VERIFICATION_ITEMS.length} marked
              </Badge>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-500">
              Tick what you already have ready. Marking an item here is private to this page and does not verify it.
            </p>
            <div
              role="progressbar"
              aria-label="Verification readiness checklist"
              aria-valuenow={checklistPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-100"
            >
              <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${checklistPercent}%` }} />
            </div>
            <div className="mt-4 space-y-1.5" role="group" aria-label="Verified-data requirements">
              {VERIFICATION_ITEMS.map((item) => (
                <Checkbox
                  key={item.id}
                  checked={Boolean(checkedItems[item.id])}
                  onChange={(checked) =>
                    setCheckedItems((previous) => ({ ...previous, [item.id]: checked }))
                  }
                  label={item.label}
                  description={item.description}
                />
              ))}
            </div>
          </section>

          <section aria-labelledby="owner-next-steps-heading" className="space-y-4">
            <div>
              <p className="field-label">Next steps</p>
              <h2 id="owner-next-steps-heading" className="font-display text-lg font-extrabold text-ink-950">
                Open an owner tool
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-500">
                Both tools are explorable previews. No details are transmitted or stored.
              </p>
            </div>
            <Link
              to="/owner/add-property"
              className="card group flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lift"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <PlusCircle className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-sm font-bold text-ink-900">Add property</span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-500">
                  Preview every section of the owner form, from pricing breakdown to contact preference.
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                  Open the form <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                </span>
              </span>
            </Link>
            <Link
              to="/owner/listings"
              className="card group flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lift"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-700">
                <ClipboardList className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-sm font-bold text-ink-900">Manage listings</span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-500">
                  See the status tabs and bulk-action layout. The list is empty because no inventory exists yet.
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                  Open the manager <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                </span>
              </span>
            </Link>
          </section>
        </div>
      </div>
    </PageShell>
  );
}

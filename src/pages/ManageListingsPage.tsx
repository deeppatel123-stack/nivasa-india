import { useRef, useState, type KeyboardEvent } from 'react';
import {
  Building2,
  ClipboardList,
  FileText,
  Info,
  PlusCircle,
  Send,
  ShieldCheck,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { OwnerNav } from '@/components/owner/OwnerNav';
import { OwnerPreviewNotice } from '@/components/owner/OwnerPreviewNotice';
import { Badge } from '@/components/ui/Badge';
import { Button, LinkButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/store/useToastStore';

type ListingStatus = 'draft' | 'published' | 'needs-verification';
type ListingTab = 'all' | ListingStatus;

interface ManagedListing {
  id: string;
  title: string;
  status: ListingStatus;
}

const TABS: Array<{ key: ListingTab; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'published', label: 'Published' },
  { key: 'needs-verification', label: 'Needs verification' },
];

const BULK_ACTIONS: Array<{ label: string; icon: LucideIcon; message: string }> = [
  { label: 'Publish selected', icon: Send, message: 'Publishing is not connected — no listing was changed.' },
  { label: 'Move to draft', icon: FileText, message: 'Status changes are not connected — nothing was updated.' },
  {
    label: 'Request verification',
    icon: ShieldCheck,
    message: 'Verification requests are not connected — nothing was sent.',
  },
  { label: 'Delete', icon: Trash2, message: 'Deleting is not connected — nothing was removed.' },
];

const MANAGEMENT_NOTES: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: FileText,
    title: 'Drafts come first',
    description: 'A future backend would save incomplete listings privately before any review.',
  },
  {
    icon: ShieldCheck,
    title: 'Verification is required',
    description: 'Ownership proof and accurate details would be checked before publication.',
  },
  {
    icon: ClipboardList,
    title: 'Edits are controlled',
    description: 'Only verified owners would be able to edit or retire their own listings.',
  },
];

const EMPTY_COPY: Record<ListingTab, { title: string; description: string; icon: LucideIcon }> = {
  all: {
    title: 'No owner listings yet',
    description:
      'There are no owner-created listings in this frontend phase. Demo stays in Explore are illustrative examples and are never shown here as yours.',
    icon: Building2,
  },
  draft: {
    title: 'No drafts to review',
    description: 'Nothing has been saved as a draft. Form entries stay on the Add property page until you reload it.',
    icon: FileText,
  },
  published: {
    title: 'Nothing published',
    description: 'Publishing is not connected in this phase, so no listing can appear in this tab.',
    icon: Send,
  },
  'needs-verification': {
    title: 'Nothing awaiting verification',
    description: 'Verification requests need a backend and a review team. No request has been submitted.',
    icon: ShieldCheck,
  },
};

export function ManageListingsPage() {
  // Owner inventory is empty in the frontend phase; this state is the single source for all counts.
  const [listings] = useState<ManagedListing[]>([]);
  const [activeTab, setActiveTab] = useState<ListingTab>('all');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pushToast = useToastStore((state) => state.push);

  const visibleListings = activeTab === 'all' ? listings : listings.filter((listing) => listing.status === activeTab);
  const emptyCopy = EMPTY_COPY[activeTab];
  const EmptyIcon = emptyCopy.icon;

  function countFor(tab: ListingTab): number {
    return tab === 'all' ? listings.length : listings.filter((listing) => listing.status === tab).length;
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % TABS.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = TABS.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(TABS[nextIndex].key);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <PageShell
      eyebrow="Owner tools"
      title="Manage listings"
      description="A preview of the status tabs and bulk actions an owner will use once listings exist."
      breadcrumbs={[
        { label: 'Owner tools', to: '/owner/dashboard' },
        { label: 'Manage listings' },
      ]}
      actions={
        <LinkButton to="/owner/add-property" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
          Add property
        </LinkButton>
      }
      showDemoNote={false}
    >
      <div className="space-y-6">
        <OwnerNav />
        <OwnerPreviewNotice />

        <section className="demo-strip" role="note">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            <strong className="font-semibold">Demo stays are not your listings.</strong> Illustrative seeker listings
            in Explore have no owner account. This manager never treats them as your inventory.
          </span>
        </section>

        <section className="card overflow-hidden" aria-labelledby="listing-workspace-heading">
          <div className="flex flex-col gap-3 border-b border-ink-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="field-label">Workspace</p>
              <h2 id="listing-workspace-heading" className="font-display text-lg font-extrabold text-ink-950">
                Your listings <span className="text-ink-400">({listings.length})</span>
              </h2>
            </div>
            <Badge tone="neutral">Frontend preview · no inventory</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 p-4">
            <label className="flex items-center gap-2 text-xs font-medium text-ink-500">
              <input
                type="checkbox"
                disabled
                className="h-4 w-4 accent-teal-600"
                aria-label="Select all listings (none available)"
              />
              Select all
            </label>
            <span className="hidden h-5 w-px bg-ink-200 sm:block" aria-hidden />
            <div className="flex flex-wrap gap-2">
              {BULK_ACTIONS.map(({ label, icon: Icon, message }) => (
                <Button
                  key={label}
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Icon className="h-3.5 w-3.5" />}
                  onClick={() => pushToast(message, 'info')}
                >
                  {label}
                </Button>
              ))}
            </div>
            <p className="w-full text-[11px] text-ink-500">
              Bulk actions are placeholders — clicking one shows a notice and changes nothing.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter by listing status"
            className="no-scrollbar flex gap-1 overflow-x-auto border-b border-ink-100 px-3 pt-3"
          >
            {TABS.map((tab, index) => {
              const selected = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`owner-tab-${tab.key}`}
                  aria-controls="owner-listings-panel"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(tab.key)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-t-xl px-3 py-2.5 text-xs font-semibold transition sm:text-sm',
                    selected
                      ? 'border-b-2 border-teal-600 bg-teal-50/60 text-teal-800'
                      : 'border-b-2 border-transparent text-ink-500 hover:bg-ink-50 hover:text-ink-800',
                  )}
                >
                  {tab.label}
                  <Badge tone={selected ? 'teal' : 'neutral'}>{countFor(tab.key)}</Badge>
                </button>
              );
            })}
          </div>

          <div
            id="owner-listings-panel"
            role="tabpanel"
            aria-labelledby={`owner-tab-${activeTab}`}
            tabIndex={0}
          >
            <div className="hidden border-b border-ink-100 md:block">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  Listing management columns. There are no owner listings in the frontend phase.
                </caption>
                <thead className="surface-muted text-[11px] uppercase tracking-[0.08em] text-ink-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Listing
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Rent
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Updated
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            <div className="p-5 sm:p-8">
              {visibleListings.length === 0 ? (
                <EmptyState
                  icon={EmptyIcon}
                  title={emptyCopy.title}
                  description={emptyCopy.description}
                  action={
                    <LinkButton to="/owner/add-property" variant="secondary" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
                      Add a property
                    </LinkButton>
                  }
                  secondary={
                    <LinkButton to="/owner/dashboard" variant="ghost" size="sm">
                      Back to overview
                    </LinkButton>
                  }
                />
              ) : (
                <ul className="divide-y divide-ink-100">
                  {visibleListings.map((listing) => (
                    <li key={listing.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
                      <span className="font-semibold text-ink-800">{listing.title}</span>
                      <Badge tone="neutral">{listing.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section aria-labelledby="management-notes-heading">
          <p className="field-label">How it will work</p>
          <h2 id="management-notes-heading" className="font-display text-lg font-extrabold text-ink-950">
            Management, once connected
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {MANAGEMENT_NOTES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card p-5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-50 text-ink-700">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <h3 className="mt-3 text-sm font-bold text-ink-900">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card flex flex-col gap-5 bg-ink-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <Badge tone="amber">Next step</Badge>
            <h2 className="mt-3 font-display text-xl font-extrabold">Ready to preview an owner listing?</h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-100">
              Explore the form to see the details you will need when real submission and verification are available.
            </p>
          </div>
          <LinkButton
            to="/owner/add-property"
            variant="secondary"
            leftIcon={<PlusCircle className="h-4 w-4" />}
            className="shrink-0"
          >
            Add a property
          </LinkButton>
        </section>
      </div>
    </PageShell>
  );
}

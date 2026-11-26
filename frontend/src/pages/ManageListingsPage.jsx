import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, FileText, LockKeyhole, PlusCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { OwnerNav } from '@/components/owner/OwnerNav';
import { OwnerPreviewNotice } from '@/components/owner/OwnerPreviewNotice';
import { Badge } from '@/components/ui/Badge';
import { Button, LinkButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatINR } from '@/features/pricing/pricing';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending review' },
  { key: 'published', label: 'Published' },
  { key: 'unpublished', label: 'Not published' },
];

function matchesTab(tab, item) {
  if (tab === 'all') return true;
  if (tab === 'pending') return String(item.status ?? '').toLowerCase() === 'pending';
  if (tab === 'published') return item.published === true;
  return item.published === false;
}

function statusTone(status) {
  const value = String(status ?? '').toLowerCase();
  if (value === 'pending') return 'amber';
  if (value === 'approved' || value === 'published') return 'green';
  if (value === 'rejected') return 'red';
  return 'neutral';
}

function RecordCard({ item }) {
  return (
    <li className="rounded-xl border border-ink-100 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-words text-sm font-bold text-ink-900">{item.title || 'Untitled listing'}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone={statusTone(item.status)}>{item.status ?? 'Pending'}</Badge>
          <Badge tone={item.published === true ? 'green' : 'neutral'}>
            {item.published === true ? 'Published' : 'Not published'}
          </Badge>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
        <div>
          <dt className="text-ink-400">Rent</dt>
          <dd className="mt-0.5 font-semibold text-ink-800">{formatINR(item.prices?.rent)}</dd>
        </div>
        <div>
          <dt className="text-ink-400">Submitted</dt>
          <dd className="mt-0.5 font-semibold text-ink-800">{formatDate(item.submittedAt ?? item.createdAt)}</dd>
        </div>
      </dl>
    </li>
  );
}

export function ManageListingsPage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState('all');
  const tabRefs = useRef([]);
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['submissions', 'owner'],
    queryFn: ({ signal }) => apiFetch('/submissions', { signal }),
    enabled: Boolean(user),
    retry: false,
  });
  const submissions = data?.items ?? [];
  const visibleListings = submissions.filter((item) => matchesTab(activeTab, item));

  function countFor(tab) {
    return tab === 'all' ? submissions.length : submissions.filter((item) => matchesTab(tab, item)).length;
  }

  function handleTabKeyDown(event, index) {
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

  if (!user) {
    return (
      <PageShell eyebrow="Owner tools" title="Manage listings" description="Review your submitted properties and their status." breadcrumbs={[{ label: 'Owner dashboard', to: '/owner/dashboard' }, { label: 'Manage listings' }]}>
        <div className="space-y-6">
          <OwnerNav />
          <div className="mx-auto max-w-2xl">
            <EmptyState
              icon={LockKeyhole}
              title="Log in to see your listings"
              description="Sign in to view and manage the properties you have submitted."
              action={<LinkButton to="/login" state={{ from: '/owner/listings' }} leftIcon={<LockKeyhole className="h-4 w-4" />}>Log in</LinkButton>}
              secondary={<LinkButton to="/owner/dashboard" variant="outline">Owner dashboard</LinkButton>}
            />
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Owner tools"
      title="Manage listings"
      description="Track your submitted properties and their review status."
      breadcrumbs={[{ label: 'Owner dashboard', to: '/owner/dashboard' }, { label: 'Manage listings' }]}
      actions={<LinkButton to="/owner/add-property" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>Add property</LinkButton>}
    >
      <div className="space-y-6">
        <OwnerNav />
        <OwnerPreviewNotice />

        <section className="card overflow-hidden" aria-labelledby="listing-workspace-heading">
          <div className="flex flex-col gap-3 border-b border-ink-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="field-label">Workspace</p>
              <h2 id="listing-workspace-heading" className="font-display text-lg font-extrabold text-ink-950">
                Your listings <span className="text-ink-400">({submissions.length})</span>
              </h2>
            </div>
            <Button type="button" variant="outline" size="sm" loading={isFetching} onClick={() => refetch()} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
              Refresh
            </Button>
          </div>

          <div role="tablist" aria-label="Filter by status" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-ink-100 px-3 pt-3">
            {TABS.map((tab, index) => {
              const selected = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  ref={(element) => { tabRefs.current[index] = element; }}
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
                    selected ? 'border-b-2 border-teal-600 bg-teal-50/60 text-teal-800' : 'border-b-2 border-transparent text-ink-500 hover:bg-ink-50 hover:text-ink-800',
                  )}
                >
                  {tab.label}
                  <Badge tone={selected ? 'teal' : 'neutral'}>{countFor(tab.key)}</Badge>
                </button>
              );
            })}
          </div>

          <div id="owner-listings-panel" role="tabpanel" aria-labelledby={`owner-tab-${activeTab}`} tabIndex={0}>
            {isPending ? (
              <div className="space-y-3 p-5" role="status" aria-label="Loading your listings">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="rounded-xl border border-ink-100 p-4">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="mt-3 h-3 w-2/3" />
                  </div>
                ))}
                <span className="sr-only">Loading your listings…</span>
              </div>
            ) : isError ? (
              <div className="p-5 sm:p-8">
                <EmptyState
                  icon={ShieldCheck}
                  title="Listings could not be loaded"
                  description={error?.message || 'Something went wrong. Please try again.'}
                  action={<Button type="button" variant="secondary" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>Retry</Button>}
                />
              </div>
            ) : visibleListings.length === 0 ? (
              <div className="p-5 sm:p-8">
                <EmptyState
                  icon={activeTab === 'all' ? FileText : ClipboardList}
                  title={submissions.length === 0 ? 'No listings yet' : 'No listings in this view'}
                  description={submissions.length === 0 ? 'Properties you submit will appear here with their review status.' : 'No listings match this filter.'}
                  action={<LinkButton to="/owner/add-property" variant="secondary" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>Add a property</LinkButton>}
                />
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto border-b border-ink-100 md:block">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <caption className="sr-only">Your property listings and their status.</caption>
                    <thead className="surface-muted text-[11px] uppercase tracking-[0.08em] text-ink-500">
                      <tr>
                        <th scope="col" className="px-5 py-3 font-semibold">Property</th>
                        <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                        <th scope="col" className="px-5 py-3 font-semibold">Published</th>
                        <th scope="col" className="px-5 py-3 font-semibold">Rent</th>
                        <th scope="col" className="px-5 py-3 font-semibold">Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {visibleListings.map((item) => (
                        <tr key={item.id ?? item.externalId}>
                          <td className="px-5 py-3">
                            <p className="font-semibold text-ink-800">{item.title || 'Untitled listing'}</p>
                          </td>
                          <td className="px-5 py-3"><Badge tone={statusTone(item.status)}>{item.status ?? 'Pending'}</Badge></td>
                          <td className="px-5 py-3">
                            <Badge tone={item.published === true ? 'green' : 'neutral'}>
                              {item.published === true ? 'Published' : 'Not published'}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-ink-700">{formatINR(item.prices?.rent)}</td>
                          <td className="px-5 py-3 text-ink-700">{formatDate(item.submittedAt ?? item.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ul className="divide-y divide-ink-100 md:hidden">
                  {visibleListings.map((item) => <RecordCard key={item.id ?? item.externalId} item={item} />)}
                </ul>
              </>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
